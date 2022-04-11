import * as Interfaces from './interfaces';
import powerbi from "powerbi-visuals-api";
import DataView = powerbi.DataView;
import PrimitiveValue = powerbi.PrimitiveValue;
import DataViewValueColumnGroup = powerbi.DataViewValueColumnGroup;

export let LineValues: number[] = [];
export let Series: string[] = [];
export let DataNumeric: Interfaces.Numeric;

export let D3Data = [];

export let Columns = [];


export function transformData(dataView: DataView): void {
    // reset global var data
    // reset
    LineValues = [];
    Series = [];
    D3Data = []
    DataNumeric = {
        min: 0,
        max: 0,
        topRounded: 0,
        interval: 0
    };

    if (!dataView) {
        console.error('Dataview are missing.');
        return;
    }

    if (!dataView.categorical ||
        !dataView.categorical.categories ||
        !dataView.categorical.values ||
        !dataView.categorical.values.source) {

        console.error('One or more required Dataview data are missing.');
        return;
    }

    const series: DataViewValueColumnGroup[] = dataView.categorical.values.grouped();

    const category: powerbi.DataViewCategoryColumn = dataView.categorical.categories[0]; // get initial data from powerbi
    let columns = category.values; // creates variables to store and separate initial data
    let columnSource = category.source;
    let format = columnSource.format;
    columns = columns.map(col => { // loops through every data point in the initial dataset
        col = col ?? '';

        // formats the data value to month-year
        // ie Jul-21
        if (format && col != '') {
            let date = new Date(col.toString());
            let shortenYear = date.getFullYear().toString().substr(-2);
            let month = Interfaces.MonthNames[date.getMonth()].toString().substr(0, 3);

            return month + '-' + shortenYear;
        }

        return col ?? ''
    });

    Columns = columns;

    // get series
    series.forEach(serie => {
        let serieName: PrimitiveValue = serie.name ?? '';
        Series.push(serieName.toString());
    });

    // insert rest of data
    for (let idx = 0; idx < columns.length; ++idx) {
        let data = {
            sharedAxis: columns[idx]
        };
        // series traversal is O(1)
        series.forEach(serie => {
            let serieName: PrimitiveValue = serie.name ?? '';
            serie.values.forEach(val => {
                if (Object.keys(val.source.roles)[0] == 'Column Values') {
                    data[serieName.toString()] = val.values[idx] ?? 0;
                }
            })
        });

        D3Data.push(data);
    }

    // get threshold
    series.forEach(serie => {
        serie.values.forEach(val => {
            if (Object.keys(val.source.roles)[0] == 'Line Values') {
                LineValues.push(<number>val.values[0])
            }
        });
    });

    // console.log(D3Data)

    // remove any columns with null or empty name
    D3Data.forEach((data, idx) => {
        if (!data.sharedAxis || data.sharedAxis == '') {
            D3Data.splice(idx, 1);
        }
    });

    // set global numeric vars
    calculateNumerics(series);

    return;
}


export function calculateNumerics(series: DataViewValueColumnGroup[]): void {
    // calculates numerics from DataProcessed
    if (D3Data.length == 0 || Series.length == 0) {
        console.error('BarDataProcessed is empty. Unable to get numerics.');
        return;
    }

    let max = 0;
    D3Data.forEach(data => {
        let sum = 0;
        Series.forEach(serie => {
            sum += data[serie] ?? 0;
        })

        max = (sum > max) ? sum : max;
    });

    let range: Interfaces.Range = { min: 0, max: max };

    // compute top rounded
    let digits = (range.max - range.max % 1).toString().length;

    let roundBy = Math.max(Math.pow(10, digits - 1), 10);
    let topRounded = Math.ceil(range.max / roundBy) * roundBy;

    DataNumeric = {
        min: range.min,
        max: range.max,
        topRounded: topRounded,
        interval: 0
    };
}