'use strict'

import * as dp from './dataProcess';
import * as Interfaces from './interfaces';

import * as d3 from 'd3';
import powerbi from 'powerbi-visuals-api';
import { VisualSettings } from './settings';
import ISelectionManager = powerbi.extensibility.ISelectionManager;

// type
type Selection<T extends d3.BaseType> = d3.Selection<T, any, any, any>;

export class D3Visual {
    private _settings: VisualSettings;
    private _dataPointSeries: Interfaces.DataPointSerie[];
    private _selectionManager: ISelectionManager;
    dimension: Interfaces.Dimension;
    parent: HTMLElement = null;
    container: HTMLElement = null;
    svg: Selection<SVGElement>;
    legend: Selection<SVGElement>;

    constructor(
        parent: HTMLElement,
        settings: VisualSettings,
        dataPointSeries: Interfaces.DataPointSerie[],
        selectionManager: ISelectionManager) {

        if (parent == null) {
            console.error('Can not create d3 visual without parent node.');
            return;
        }

        // append the container to the parent element
        // remove previous children
        parent.innerHTML = null;

        // initiate settings
        this.parent = parent;
        this._settings = settings;
        this._dataPointSeries = dataPointSeries;
        this._selectionManager = selectionManager;

        // initialize barchart dimensions
        this.dimension = {
            height: parent.offsetHeight,
            width: parent.offsetWidth
        };

        // init svg and legend
        this.svg = null;
        this.legend = null;

        this.CreateVisualContainer();
    }

    public CreateVisualContainer() {
        // gets settings
        const LAYOUT_SETTINGS = this._settings.LayoutSettings;
        const BAR_SETTINGS = this._settings.BarSettings;
        const X_AXIS_SETTINGS = this._settings.XAxisSettings;
        const Y_AXIS_SETTINGS = this._settings.YAxisSettings;
        const SECOND_SERIES = this._settings.Serie2Settings;
        const FIRST_SERIES = this._settings.Serie1Settings;
        const DATA_LABEL_SETTINGS = this._settings.DataLabelSettings;
        const LEGEND_SETTINGS = this._settings.LegendSettings;
        const GROWTH_SETTINGS = this._settings.GrowthSettings;
        const PRIMARY_LABEL_SETTINGS = this._settings.PrimaryLabelSettings;
        const PRIMARY_LINE_SETTINGS = this._settings.PrimaryLineSettings;
        const SECONDARY_LABEL_SETTINGS = this._settings.SecondaryLabelSettings;
        const SECONDARY_LINE_SETTINGS = this._settings.SecondaryLineSettings;

        // create visual container
        this.container = document.createElement('div');
        this.container.setAttribute('class', 'visual-container');
        this.container.style.width = '100%';
        this.container.style.height = '100%'; // padding compensation
        this.parent.appendChild(this.container);

        // get legend svg
        let legendSelector = document.createElement('div');
        legendSelector.setAttribute('class', 'legend-selector');
        legendSelector.style.height = this.container.offsetHeight + 'px';
        this.container.appendChild(legendSelector);

        let legendSvg = d3.select(legendSelector)
            .append('svg')
            .classed('legend-svg', true)
            .attr('width', '100%')
            .attr('height', this.container.offsetHeight)
            .style('position', 'absolute');

        // get svg by selecting container
        let svgSelector = document.createElement('div');
        svgSelector.setAttribute('class', 'svg-selector');
        svgSelector.style.height = this.container.offsetHeight + 'px';
        this.container.appendChild(svgSelector);

        let svg = d3.select(svgSelector)
            .append('svg')
            .classed('visual-svg', true);

        this.svg = svg;

        // get and set svg attr
        let xPadding = LAYOUT_SETTINGS.ChartXMargin;
        let yPadding = LAYOUT_SETTINGS.ChartYMargin;

        let width = svgSelector.offsetWidth - xPadding;
        let height = svgSelector.offsetHeight - yPadding;
        let marginTop = 40;

        // adjusts padding to add more space for legend
        if (LEGEND_SETTINGS.LegendPosition == 'bottom' && LEGEND_SETTINGS.LegendToggle) {
            height = this.dimension.height - yPadding;
            marginTop = 20;
        }

        svg.attr('width', width)
            .attr('height', height)
            .style('margin-top', `${marginTop}px`)
            .attr('overflow', 'visible');

        // set x axis values
        let x = d3.scaleBand()
            .domain(dp.D3Data.map(data => data.sharedAxis))
            .range([0, width])
            .padding(LAYOUT_SETTINGS.XAxisBarWhiteSpace);

        // set x axis
        let xAxis = d3.axisBottom(x);

        // set x axis group
        let xAxisG = svg.append('g')
            .classed('x-axis-g', true);

        // create x axis attr call
        let setXAxisGAttr = g => {
            g.selectAll('line').remove(); // removes gridlines

            // font settings
            g.selectAll('.x-axis-g text')
                .style('fill', X_AXIS_SETTINGS.FontColor)
                .style('font-family', X_AXIS_SETTINGS.FontFamily)
                .style('font-size', X_AXIS_SETTINGS.FontSize);

            g.selectAll('.x-axis-g text')
                .attr('transform', `translate(${X_AXIS_SETTINGS.XOffset}, ${-X_AXIS_SETTINGS.YOffset + height}) rotate(-${X_AXIS_SETTINGS.LabelAngle})`)
                .style('text-anchor', X_AXIS_SETTINGS.LabelAngle ? 'end' : 'middle');
        }

        // render x axis
        xAxisG.call(xAxis)
            .call(setXAxisGAttr);

        // set y axis value
        let y = d3.scaleLinear()
            .domain([0, 500])
            .range([height, 0]);

        // set y axis
        let yAxis = d3.axisLeft(y)
            .tickSize(-width) // draws horizontal gridline across the chart
            .tickFormat(data => {
                // formats y-axis labels with appropriate units
                return nFormatter(parseInt(data.toString()), 1, Y_AXIS_SETTINGS.DisplayUnits);
            });

        // set y axis group
        let yAxisG = svg.append('g')
            .classed('y-axis-g', true);

        // create y axis attr call
        let setYAxisGAttr = _ => {
            d3.selectAll('line')
                .attr('stroke-dasharray', '1,3')
                .attr('stroke', 'grey')
                .attr('stroke-width', +Y_AXIS_SETTINGS.ToggleGridLines)
                .style('fill', Y_AXIS_SETTINGS.FontColor)
            d3.selectAll('.y-axis-g text')
                .style('fill', Y_AXIS_SETTINGS.FontColor)
                .style('font-family', Y_AXIS_SETTINGS.FontFamily)
                .style('font-size', Y_AXIS_SETTINGS.FontSize);
        }

        // render y axis
        yAxisG.call(yAxis.ticks(Y_AXIS_SETTINGS.TickCount))
            .call(setYAxisGAttr);

        // generate stack
        let serieStack = d3.stack().keys(dp.Series);
        let stackData = serieStack(dp.D3Data);
        // console.log(stackData)

        // true width gets actual width of chart 
        // useful for secondary growth indicator and legend
        let trueWidth = width + xPadding;

        // create legend
        if (LEGEND_SETTINGS.LegendToggle) {
            let legendRectHeight = 15;
            let legendHorizontalPadding = 30;

            // creates group with class legend for each data element
            let legend = legendSvg.selectAll('.legend')
                .data(stackData)
                .enter()
                .append('g')
                .classed('legend', true);

            // the following code will dynamically position each g element
            // and then append the appropriate text label and color

            let legendWidth = 0;

            // calculates text width for each name based on font size and family
            dp.Series.forEach(serieName => {
                // gets width
                let nameWidth = this.getTextWidth(serieName, LEGEND_SETTINGS);

                if (LEGEND_SETTINGS.LegendPosition == 'left') {
                    // sets longest name as legend width
                    legendWidth = Math.max(nameWidth, legendWidth);
                } else {
                    // sets sum of names as legend width
                    legendWidth += nameWidth + legendHorizontalPadding;
                }
            });

            // checks if legend exceeds chart borders
            legendWidth = legendWidth > trueWidth ? trueWidth : legendWidth;

            // currwidth determines current horizontal position of legend labels
            let currWidth = 0;
            // row for legend wrapping, determines what row to place label on
            let row = 0;

            // displays legend based on selected position
            // left: starting top left, display vertically
            if (LEGEND_SETTINGS.LegendPosition == 'left') {
                // places each legend label
                legend.attr('transform', (_, i) => {

                    // displays each label below previous label
                    let n = dp.Series.length;
                    return 'translate(0,' + (i % n * legendRectHeight) + ')';
                });

            } else {
                // bottom: display at bottom center of chart
                if (LEGEND_SETTINGS.LegendPosition == 'bottom') {
                    // centers legend
                    let centerOffset = (trueWidth - legendWidth) / 2;
                    currWidth = centerOffset;
                }

                // top: starting top left, display horizontally
                // places each legend label
                legend.attr('transform', serie => {
                    let nameWidth = this.getTextWidth(serie.key, LEGEND_SETTINGS);

                    // allows legend wrapping
                    if (currWidth + nameWidth + legendHorizontalPadding > trueWidth) {
                        // increments row if legend exceeds chart borders
                        row++;
                        // resets width
                        currWidth = 0;
                    }
                    // displays each label at current width, height is determined using the row
                    let t = 'translate(' + currWidth + ',' + row * legendRectHeight + ')';

                    // increments width
                    currWidth += nameWidth + legendHorizontalPadding;
                    return t;
                });
            }

            // adds squares for serie colours
            let legendColor = legend.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('y', 0)
                .attr('fill', (_, idx) => idx ? FIRST_SERIES.SerieColor : SECOND_SERIES.SerieColor);

            // adds legend text
            let legendText = legend.append('text')
                .attr('x', 15)
                .attr('y', 10)
                .style('fill', LEGEND_SETTINGS.FontColor)
                .style('font-family', LEGEND_SETTINGS.FontFamily)
                .style('font-size', LEGEND_SETTINGS.FontSize)
                .text(d => d.key);

            // places legend at bottom of chart
            let legendMargin = LEGEND_SETTINGS.LegendMargin;
            if (LEGEND_SETTINGS.LegendPosition == 'bottom') {
                legendColor.attr('y', legendSelector.offsetHeight - legendMargin - 10);
                legendText.attr('y', legendSelector.offsetHeight - legendMargin);

            } else if (LEGEND_SETTINGS.LegendPosition == 'left') {
                // adds margin for legend
                svg.style('margin-left', `${legendWidth + 40}px`);
            }
        }

        let displayUnits = DATA_LABEL_SETTINGS.DisplayUnits;
        let displayDigits = DATA_LABEL_SETTINGS.DisplayDigits;

        // iterate through each serie stack
        stackData.forEach((serie, idx) => {
            // create bar
            let bar = svg.selectAll('.bar')
                .enter()
                .data(serie)
                .join('rect')
                .classed('bar', true)
                .attr('fill', idx ? FIRST_SERIES.SerieColor : SECOND_SERIES.SerieColor)
                .attr('stroke-width', BAR_SETTINGS.BarBorder)
                .attr('stroke-dasharray', '1,3')
                .attr('stroke', BAR_SETTINGS.BarBorderColor)
                .attr('width', x.bandwidth())
                .attr('x', data => x(data.data.sharedAxis.toString()))
                .attr('serie', dp.Series[idx])
                .attr('xIdx', (_, i) => i);

            // create label on each bar
            let barLabel = null;

            if (idx ? FIRST_SERIES.BarLabelToggle : SECOND_SERIES.BarLabelToggle) {
                barLabel = svg.selectAll('.label')
                    .data(serie)
                    .enter()
                    .append('text')
                    .attr('width', x.bandwidth())
                    .attr('height', DATA_LABEL_SETTINGS.LabelFontSize)
                    .attr('fill', idx ? FIRST_SERIES.LabelFontColor : SECOND_SERIES.LabelFontColor)
                    .attr('font-size', DATA_LABEL_SETTINGS.LabelFontSize)
                    .attr('font-family', DATA_LABEL_SETTINGS.FontFamily)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle');

                barLabel.attr('x', data => x(data.data.sharedAxis.toString()));
            }

            let yMax = Y_AXIS_SETTINGS.MaxValue;

            // find local max
            let localRange = this.getRange().max;

            // set primary y axis min/max values
            y.domain([0, yMax ? yMax : localRange * LAYOUT_SETTINGS.YScaleFactor]);
            yAxisG.call(yAxis)
                .call(setYAxisGAttr);

            // removes first label
            d3.select('.y-axis-g > .tick')
                .filter((_, i) => i == 0)
                .remove();

            // removes border
            d3.selectAll('.domain').remove();

            let setBarX = data => {
                if (idx) {
                    switch (BAR_SETTINGS.BarAlignment) {
                        case 'center':
                            return x(data.data.sharedAxis.toString()) + x.bandwidth() / 2 - x.bandwidth() * BAR_SETTINGS.BarPadding / 2;
                        case 'left':
                            return x(data.data.sharedAxis.toString());
                        case 'right':
                            return x(data.data.sharedAxis.toString()) + x.bandwidth() / 2;
                        default:
                            break;
                    }
                } else {
                    return x(data.data.sharedAxis.toString());
                }
            }

            // set bar positions & height
            bar.data(serie)
                .attr('x', data => setBarX(data))
                .attr('width', idx ? x.bandwidth() * BAR_SETTINGS.BarPadding : x.bandwidth())
                // y attr sets starting position from which bar rendered
                .attr('y', data => y(data[1] - data[0]))
                // height sets height of rectangle rendered from starting y pos
                .attr('height', data => y(data[0]) - y(data[1]));

            // show text if bar height allows and bar labels are toggled on
            if (idx ? FIRST_SERIES.BarLabelToggle : SECOND_SERIES.BarLabelToggle) {
                let getLabelText = data => {
                    // gets data value
                    let val = data.data[dp.Series[idx]];

                    // gets bar height
                    let barHeight = y(data[0]) - y(data[1]);

                    // max allowable text width
                    let maxTextWidth = x.bandwidth() / dp.Series.length + DATA_LABEL_SETTINGS.LabelDisplayTolerance;

                    val = nFormatter(val, displayDigits, displayUnits);
                    let textWidth = this.getTextWidth(val, DATA_LABEL_SETTINGS);

                    if (textWidth > maxTextWidth ||
                        barHeight <= DATA_LABEL_SETTINGS.LabelFontSize) {
                        return null;
                    }

                    return {
                        value: val,
                        width: textWidth
                    }
                }

                let labelPos = idx ? FIRST_SERIES.BarLabelPosition : SECOND_SERIES.BarLabelPosition;
                if (labelPos == 'mid') {
                    barLabel.text(data => getLabelText(data).value)
                        .attr('x', data => setBarX(data) + (idx ? x.bandwidth() * BAR_SETTINGS.BarPadding : x.bandwidth()) / 2)
                        .attr('y', data => height - (y(data[0]) - y(data[1])) / 2);

                } else if (labelPos == 'top') {

                    if (idx ? FIRST_SERIES.LabelBgToggle : SECOND_SERIES.LabelBgToggle) {
                        // background
                        let bgPadding = 8;
                        svg.selectAll('.labelBg')
                            .data(serie)
                            .enter()
                            .append('rect')
                            .attr('width', data => this.getTextWidth((data[1] - data[0]).toString(), DATA_LABEL_SETTINGS) + bgPadding)
                            .attr('height', DATA_LABEL_SETTINGS.LabelFontSize + bgPadding / 2)
                            .attr('fill', idx ? FIRST_SERIES.LabelBackgroundColor : SECOND_SERIES.LabelBackgroundColor)
                            .attr('y', data => y(data[1] - data[0]) - 18)
                            .attr('x', data => x(data.data.sharedAxis.toString()) + x.bandwidth() / 4);
                    }

                    barLabel.text(data => getLabelText(data).value)
                        .attr('x', data => setBarX(data) + (idx ? x.bandwidth() * BAR_SETTINGS.BarPadding : x.bandwidth()) / 2)
                        .attr('y', data => y(data[1] - data[0]) - 10);
                }
            }
        });

        let heightOffset = PRIMARY_LINE_SETTINGS.LineOffsetHeight;

        // draw primary growth indicators
        if (dp.Series.length > 1 &&
            GROWTH_SETTINGS.TogglePrimaryIndicators) {

            let primarySelectors = GROWTH_SETTINGS.PrimarySelector;
            let primSel = [];

            primarySelectors.split(',').forEach(s => primSel.push(s.trim()));

            let drawPrimaryIndicators = (data1, data2, dataset) => {
                // if data is not 0 - no point in rendering indicators for a column of 0s
                if (data1 && data2) {
                    try {
                        // initializes coordinate points based on bars selected
                        let growth1Y = y(data1) - heightOffset;
                        let growth2Y = y(data2) - heightOffset;
                        let growth1X = x(dataset.sharedAxis.toString());
                        let growth2X = x(dataset.sharedAxis.toString()) + x.bandwidth() / 2;

                        // sets x position to the center of the bar
                        growth1X += x.bandwidth() / 4;
                        growth2X += x.bandwidth() / 4;

                        let averageX = (growth1X + growth2X) / 2;

                        // represents top border of the chart (excluding legend and other labels), defaults to 0
                        let maxYPos = y(y.domain()[1]);

                        let yPos = maxYPos;
                        // gets y pos for label
                        if (!PRIMARY_LINE_SETTINGS.AlignIndicators) {
                            yPos = Math.min(growth1Y, growth2Y) - PRIMARY_LABEL_SETTINGS.LabelHeight * 2

                            // ensures yPos does not exceed max, though technically max is actually a min
                            yPos = yPos > maxYPos ? yPos : maxYPos;

                            yPos -= PRIMARY_LABEL_SETTINGS.LabelOffsetHeight;
                        }

                        // draw line
                        let path = d3.line()([
                            [growth1X, growth1Y],
                            [growth1X, yPos],
                            [growth2X, yPos],
                            [growth2X, growth2Y]]);

                        this.drawLine(path, 'growthLine', PRIMARY_LINE_SETTINGS);

                        // calculate label text
                        let growthValue = (1 - data1 / data2) * 100;
                        growthValue = PRIMARY_LABEL_SETTINGS.ShowSign ? growthValue : Math.abs(growthValue);
                        let growthValueRounded = Math.round(growthValue * 10) / 10 + '%';

                        // draw label background shape
                        this.drawEllipse(averageX, yPos, growthValueRounded.toString(), PRIMARY_LABEL_SETTINGS);

                        // draw label text
                        this.drawText(averageX, yPos, PRIMARY_LABEL_SETTINGS, growthValueRounded.toString());

                        switch (PRIMARY_LINE_SETTINGS.DisplayArrow) {
                            case 'left':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, PRIMARY_LINE_SETTINGS, 60);
                                break;

                            case 'right':
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, PRIMARY_LINE_SETTINGS, 60);
                                break;

                            case 'both':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, PRIMARY_LINE_SETTINGS, 60);
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, PRIMARY_LINE_SETTINGS, 60);
                                break;

                            default:
                                break;
                        }
                    } catch (e) {
                        this.container.innerHTML = "Unable to create primary growth labels";
                    }
                }
            }

            if (primSel[0]) {
                primSel.forEach(selector => {
                    if (selector) {
                        let data1 = dp.D3Data[this.getIndex(selector)][dp.Series[0]];
                        let data2 = dp.D3Data[this.getIndex(selector)][dp.Series[1]];

                        drawPrimaryIndicators(data1, data2, dp.D3Data[this.getIndex(selector)]);
                    }
                });
            } else {
                dp.D3Data.forEach(dataset => {
                    // gets corresponding serie data based on selectors
                    let data1 = dataset[dp.Series[0]];
                    let data2 = dataset[dp.Series[1]];

                    drawPrimaryIndicators(data1, data2, dataset);
                });
            }
        }

        // adds secondary growth indicator
        if (dp.Series.length > 1 &&
            GROWTH_SETTINGS.ToggleSecondaryIndicator) {

            let secondarySelectors = GROWTH_SETTINGS.SecondarySelector;
            let secSel = [];

            secondarySelectors.split(',').forEach(s => secSel.push(s.trim()));

            let drawSecondaryIndicators = (data1, data2, dataset) => {
                // if data is not 0 - no point in rendering indicators for a column of 0s
                if (data1 && data2) {
                    try {
                        // initializes coordinate points based on bars selected
                        let growth1Y = y(data1);
                        let growth2Y = y(data2);

                        let averageY = (growth2Y + growth1Y) / 2;

                        // calculates starting x positions for line, defaults to right corner of bar
                        let growth1X = x(dataset.sharedAxis.toString());
                        let growth2X = x(dataset.sharedAxis.toString());

                        // calculates x pos for label
                        let xPos = Math.min(growth2X, growth1X) - SECONDARY_LABEL_SETTINGS.xOffset;
                        // ensures x pos does not exceed width
                        xPos = xPos < 0 ? 0 : xPos;

                        if (SECONDARY_LABEL_SETTINGS.DisplaySide == 'right') {
                            // adds offset to account for bar width
                            growth1X += x.bandwidth() / dp.Series.length;
                            growth2X += x.bandwidth() / dp.Series.length;

                            // gets desired x position
                            xPos = Math.max(growth2X, growth1X) + SECONDARY_LABEL_SETTINGS.xOffset;
                            // ensures x pos does not exceed width
                            xPos = xPos < trueWidth ? xPos : trueWidth;
                        }

                        // draw line
                        let path = d3.line()([
                            [growth1X, growth1Y],
                            [xPos, growth1Y],
                            [xPos, growth2Y],
                            [growth2X, growth2Y]]);

                        this.drawLine(path, 'growthLineValues', SECONDARY_LINE_SETTINGS);

                        // sets line type
                        if (SECONDARY_LINE_SETTINGS.LineType == 'dashed') {
                            svg.selectAll('.growthLineValues')
                                .attr('stroke-dasharray', '5,4');
                        }

                        // calculate label text
                        let growthValue = (1 - data1 / data2) * 100;
                        growthValue = SECONDARY_LABEL_SETTINGS.ShowSign ? growthValue : Math.abs(growthValue);
                        let growthValueRounded = Math.round(growthValue * 10) / 10 + '%';

                        // draw label background shape
                        this.drawEllipse(xPos, averageY, growthValueRounded.toString(), SECONDARY_LABEL_SETTINGS);

                        // draw label text
                        this.drawText(xPos, averageY, SECONDARY_LABEL_SETTINGS, growthValueRounded.toString());

                        switch (SECONDARY_LINE_SETTINGS.DisplayArrow) {
                            case 'left':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, SECONDARY_LINE_SETTINGS, 30);
                                break;

                            case 'right':
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, SECONDARY_LINE_SETTINGS, 30);
                                break;

                            case 'both':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, SECONDARY_LINE_SETTINGS, 30);
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, SECONDARY_LINE_SETTINGS, 30);
                                break;

                            default:
                                break;
                        }
                    } catch (e) {
                        this.container.innerHTML = "Unable to create secondary growth labels";
                    }
                }
            }

            if (secSel[0]) {
                secSel.forEach(selector => {
                    if (selector) {
                        let data1 = dp.D3Data[this.getIndex(selector)][dp.Series[0]];
                        let data2 = dp.D3Data[this.getIndex(selector)][dp.Series[1]];

                        drawSecondaryIndicators(data1, data2, dp.D3Data[this.getIndex(selector)]);
                    }
                });
            } else {
                dp.D3Data.forEach(dataset => {
                    // gets corresponding serie data based on selectors
                    let data1 = dataset[dp.Series[0]];
                    let data2 = dataset[dp.Series[1]];

                    drawSecondaryIndicators(data1, data2, dataset);
                });
            }
        }
    }

    // gets range of data
    private getRange(): Interfaces.Range {
        /* 
        * Param: none 
        * Returns: max, min
        */
        let localMax = 0;
        dp.D3Data.forEach(data => {
            dp.Series.forEach(serie => {
                localMax = (data[serie] > localMax) ? data[serie] : localMax;
            });
        });

        // compute top rounded
        let digits = (localMax - localMax % 1).toString().length;

        let roundBy = Math.max(Math.pow(10, digits - 1), 10);
        let topRounded = Math.ceil(localMax / roundBy) * roundBy;

        return {
            max: topRounded,
            min: 0
        }
    }

    // get index of selector
    private getIndex(selector: string): number {
        /* 
        * Param: selector 
        * Returns: corresponding column index in data table
        */
        let selectedIdx = -1;

        dp.D3Data.forEach((data, idx) => {
            if (data.sharedAxis == selector)
                selectedIdx = idx;
        });

        // sanity check
        if (selectedIdx == -1) {
            this.parent.innerHTML = 'Growth Selector not correct';
            return selectedIdx;
        }

        return selectedIdx;
    }

    // gets displayed width of text
    private getTextWidth(text: string, settings: any): number {
        /* 
        * Param: selector, settings
        * Returns: width of text based on font size and family
        */
        try {
            let fontFamily = settings.FontFamily;
            let fontSize = settings.FontSize;

            let font = fontSize + 'px ' + fontFamily;

            let canvas = document.createElement('canvas');
            let context = canvas.getContext("2d");
            context.font = font;

            return context.measureText(text).width;
        } catch (e) {
            console.error(e);
        }
    }

    // draws triangles/arrows on the svg
    private drawTriangle(x: number, y: number, settings: any, rotation: number) {
        /* 
        * Param: x coord, y coord, settings, rotation 
        * Returns: none
        */
        this.svg.append('path')
            .attr('d', d3.symbol().type(d3.symbolTriangle).size(settings.ArrowSize))
            .attr('fill', settings.LineColor)
            .attr('transform', `translate(${x}, ${y}) rotate(${rotation})`);
    }

    // adds text to svg
    private drawText(x: number, y: number, settings: any, text: string) {
        /* 
        * Param: x coord, y coord, settings, text 
        * Returns: none
        */
        this.svg.append('text')
            .attr('width', settings.LabelMinWidth)
            .attr('height', settings.LabelHeight)
            .attr('fill', settings.FontColor)
            .attr('font-size', settings.FontSize)
            .attr('font-family', settings.FontFamily)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('y', y)
            .attr('x', x)
            .text(text);
    }

    // draws label background shape
    private drawEllipse(cx: number, cy: number, text: string, settings: any) {
        /* 
        * Param: x coord, y coord, text, settings 
        * Returns: none
        */
        if (settings.ToggleBgShape) {
            let textWidth = this.getTextWidth(text, settings);
            this.svg.append('ellipse')
                .attr('rx', settings.LabelMinWidth + 10 > textWidth ? settings.LabelMinWidth : textWidth - 10) // resizes label based on text width
                .attr('ry', settings.LabelHeight)
                .attr('cx', cx)
                .attr('cy', cy)
                .attr('fill', settings.LabelBackgroundColor)
                .attr('stroke', settings.BorderColor)
                .attr('stroke-width', settings.BorderSize);
        }
    }

    // draws line
    private drawLine(path: string, classed: string, settings: any) {
        /* 
        * Param: path, class name, settings 
        * Returns: none
        */
        this.svg.append('path')
            .attr('fill', 'none')
            .attr('stroke', settings.LineColor)
            .attr('stroke-width', settings.LineSize)
            .attr('d', path)
            .classed(classed, true);
    }
}

function nFormatter(num: number, digits: number, displayUnits: string): string {
    // converts 15,000 to 15k and etc
    let si = [
        { value: 1, symbol: '', text: 'none' },
        { value: 1E3, symbol: 'K', text: 'thousands' },
        { value: 1E6, symbol: 'M', text: 'millions' },
        { value: 1E9, symbol: 'B', text: 'billions' },
        { value: 1E12, symbol: 'T', text: 'trillions' },
        { value: 1E15, symbol: 'P', text: 'quadrillions' },
        { value: 1E18, symbol: 'E', text: 'quintillions' }
    ];

    let i;
    // converts numbers into largest reasonable units unless otherwise specified
    if (displayUnits == 'auto') {
        for (i = si.length - 1; i > 0; i--) {
            if (num >= si[i].value) {
                break;
            }
        }
    } else {
        for (i = 0; i < si.length - 1; i++) {
            if (displayUnits == si[i].text) {
                break;
            }
        }
    }
    return (num / si[i].value).toFixed(digits) + si[i].symbol;
}