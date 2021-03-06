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
        const PATTERN_SETTINGS = this._settings.PatternSettings;
        const X_AXIS_SETTINGS = this._settings.XAxisSettings;
        const Y_AXIS_SETTINGS = this._settings.YAxisSettings;
        const TARGET_SERIES = this._settings.TargetSeries;
        const VALUE_SERIES = this._settings.ValueSeries;
        const DATA_LABEL_SETTINGS = this._settings.DataLabelSettings;
        const LEGEND_SETTINGS = this._settings.LegendSettings;
        const GROWTH_BAR_SETTINGS = this._settings.GrowthBarSettings;
        const GROWTH_LABEL_SETTINGS = this._settings.GrowthLabelSettings;
        const PRIMARY_GROWTH_SETTINGS = this._settings.PrimaryGrowthSettings;
        const LINE_SETTINGS = this._settings.LineSettings;
        const PRIMARY_LABEL_SETTINGS = this._settings.PrimaryLabelSettings;
        const PRIMARY_LINE_SETTINGS = this._settings.PrimaryLineSettings;
        const SECONDARY_GROWTH_SETTINGS = this._settings.SecondaryGrowthSettings;
        const SECONDARY_LABEL_SETTINGS = this._settings.SecondaryLabelSettings;
        const SECONDARY_LINE_SETTINGS = this._settings.SecondaryLineSettings;
        const SECONDARY_Y_AXIS = this._settings.SecondaryYAxis;

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
        let yPadding = LAYOUT_SETTINGS.ChartTopMargin + LAYOUT_SETTINGS.ChartBottomMargin;

        let width = svgSelector.offsetWidth - xPadding;
        let height = svgSelector.offsetHeight - yPadding;

        // adjusts padding to add more space for legend
        if (LEGEND_SETTINGS.LegendPosition == 'bottom' && LEGEND_SETTINGS.LegendToggle) {
            height = this.dimension.height - yPadding;
        }

        svg.attr('width', width)
            .attr('height', height)
            .style('margin-top', `${LAYOUT_SETTINGS.ChartTopMargin}px`)
            .style('margin-bottom', `${LAYOUT_SETTINGS.ChartBottomMargin}px`)
            .attr('overflow', 'visible');

        let dpSeries = dp.Series;

        if (BAR_SETTINGS.FlipSeries) {
            dpSeries = dpSeries.reverse();
        }

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
                .style('font-size', X_AXIS_SETTINGS.FontSize)
                .attr('transform', `translate(${X_AXIS_SETTINGS.XOffset}, ${-X_AXIS_SETTINGS.YOffset + height}) rotate(-${X_AXIS_SETTINGS.LabelAngle})`)
                .style('text-anchor', X_AXIS_SETTINGS.LabelAngle ? 'end' : 'middle');
        }

        // render x axis
        xAxisG.call(xAxis)
            .call(setXAxisGAttr);

        // set y axis value
        let y0 = d3.scaleLinear()
            .domain([0, 500])
            .range([height, 0]);

        // set y axis
        let yAxis = d3.axisLeft(y0)
            .tickSize(-width) // draws horizontal gridline across the chart
            .tickFormat(data => {
                // formats y-axis labels with appropriate units
                return nFormatter(parseInt(data.toString()), Y_AXIS_SETTINGS.DisplayDigits, Y_AXIS_SETTINGS.DisplayUnits);
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

        let minVal = SECONDARY_Y_AXIS.MinValue;
        let maxVal = SECONDARY_Y_AXIS.MaxValue;

        // setting secondary y axis scale
        let y1 = d3.scaleLinear()
            .domain([minVal, maxVal])
            .range([height, 0]);

        // set properties
        let secYAxis = d3.axisRight(y1)
            .tickFormat(data => {
                return nFormatter(parseInt(data.toString()), SECONDARY_Y_AXIS.DisplayDigits, SECONDARY_Y_AXIS.DisplayUnits);
            });

        // create group
        let secYAxisG = svg.append('g')
            .classed('sec-y-axis-g', true)
            .attr('transform', `translate(${width}, 0)`);

        // style text
        let setSecYAxisGAttr = _ => {
            d3.selectAll('.sec-y-axis-g line')
                .remove();

            if (SECONDARY_Y_AXIS.ToggleOn) {
                d3.selectAll('.sec-y-axis-g text')
                    .style('fill', SECONDARY_Y_AXIS.FontColor)
                    .style('font-family', SECONDARY_Y_AXIS.FontFamily)
                    .style('font-size', SECONDARY_Y_AXIS.FontSize);
            } else {
                d3.selectAll('.sec-y-axis-g text')
                    .style('fill', '#ffffff');
            }
        }

        // render secondary y axis
        secYAxisG.call(secYAxis.ticks(SECONDARY_Y_AXIS.TickCount))
            .call(setSecYAxisGAttr);

        // generate stack
        let serieStack = d3.stack().keys(dpSeries);
        let stackData = serieStack(dp.D3Data);
        // console.log(stackData)

        // true width gets actual width of chart 
        // useful for secondary growth indicator and legend
        let trueWidth = width + xPadding;

        // gets current series
        // "value series" will always be the second series, and have an index of 1
        // "target series" will always be the first, and have an index of 0
        let currSeries = idx => idx ? VALUE_SERIES : TARGET_SERIES;

        // pattern fills for bars
        let patternWidth = 8, patternHeight = 8;
        let patternRectWidth, patternRectHeight, patternCircRadius;
        switch (PATTERN_SETTINGS.PatternUnitSize) {
            case 'small':
                patternRectWidth = 2;
                patternRectHeight = 4;
                patternCircRadius = 1.2;
                break;
            case 'large':
                patternWidth = 12;
                patternHeight = 12;
                patternRectWidth = 6;
                patternRectHeight = 12;
                patternCircRadius = 4;
                break;
            default:
                patternRectWidth = 4;
                patternRectHeight = 8;
                patternCircRadius = 2;
                break;
        }

        let stripes = svg.append('defs')
            .append('pattern')
            .attr('id', 'stripes')
            .attr('width', patternWidth)
            .attr('height', patternHeight)
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('patternTransform', 'rotate(60)');

        stripes.append('rect')
            .attr('width', patternRectWidth)
            .attr('height', patternRectHeight)
            .attr('fill', PATTERN_SETTINGS.PatternColor);

        let dots = svg.append('defs')
            .append('pattern')
            .attr('id', 'dots')
            .attr('width', patternWidth)
            .attr('height', patternHeight)
            .attr('patternUnits', 'userSpaceOnUse');

        dots.append('circle')
            .attr('cx', patternWidth / 2)
            .attr('cy', patternHeight / 2)
            .attr('r', patternCircRadius)
            .attr('fill', PATTERN_SETTINGS.PatternColor);

        // create legend
        if (LEGEND_SETTINGS.LegendToggle) {
            let legendRectHeight = 15;
            let legendHorizontalPadding = 30;

            // creates group with class legend for each data element
            let legend = legendSvg.selectAll('.legend')
                .data(stackData)
                .enter()
                .filter((_, idx) => currSeries(idx).ShowSerie)
                .append('g')
                .classed('legend', true);

            // the following code will dynamically position each g element
            // and then append the appropriate text label and color

            let legendWidth = 0;

            // calculates text width for each name based on font size and family
            dpSeries.forEach(serieName => {
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
                    let n = dpSeries.length;
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
                .attr('fill', (_, idx) => {
                    let fill = VALUE_SERIES.SerieColor;
                    // if current series == target series
                    if (!idx) {
                        if (PATTERN_SETTINGS.PatternToggle) {
                            fill = PATTERN_SETTINGS.PatternType == 'dots' ? 'url(#dots)' : 'url(#stripes)';
                        } else {
                            fill = TARGET_SERIES.SerieColor;
                        }
                    }
                    return fill;
                });

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

        // hover info text
        let hoverInfoDiv = d3.select('body')
            .append('div')
            .classed('hoverInfoDiv', true)
            .style('opacity', 0)
            .style('position', 'absolute')
            .style('top', 0)
            .style('color', '#fff')
            .style('font-size', '11px')
            .on('mouseover', function () {
                let selected = d3.select(this);
                selected.style('display', 'none');
            });

        let displayUnits = DATA_LABEL_SETTINGS.DisplayUnits;
        let displayDigits = DATA_LABEL_SETTINGS.DisplayDigits;

        let growthBarOn = false;

        // user can select bars to manually adjust height
        let targetBarsSelected = [];
        TARGET_SERIES.BarSelect.split(',').forEach(s => targetBarsSelected.push(s.trim()));

        let valueBarsSelected = [];
        VALUE_SERIES.BarSelect.split(',').forEach(s => valueBarsSelected.push(s.trim()));

        // iterate through each serie stack
        stackData.forEach((serie, serieIdx) => {
            if (currSeries(serieIdx).ShowSerie) {
                // get bar fill
                let barFill = VALUE_SERIES.SerieColor;
                // if current series == target series
                if (!serieIdx) {
                    if (PATTERN_SETTINGS.PatternToggle) {
                        barFill = PATTERN_SETTINGS.PatternType == 'dots' ? 'url(#dots)' : 'url(#stripes)';
                    } else {
                        barFill = TARGET_SERIES.SerieColor;
                    }
                }

                // create bar
                let bar = svg.selectAll('.bar')
                    .enter()
                    .data(serie)
                    .join('rect')
                    .classed('bar', true)
                    .attr('fill', barFill)
                    .attr('stroke-width', 0)
                    .attr('stroke', BAR_SETTINGS.BarBorderColor)
                    .attr('width', x.bandwidth())
                    .attr('x', data => x(data.data.sharedAxis.toString()))
                    .attr('serie', dpSeries[serieIdx])
                    .attr('xIdx', (_, i) => i);

                // set border line type
                if (BAR_SETTINGS.BarBorderLineType == 'dashed') {
                    bar.attr('stroke-dasharray', '4');
                }

                // display border for series
                switch (BAR_SETTINGS.DisplayBarBorder) {
                    case 'both':
                        bar.attr('stroke-width', BAR_SETTINGS.BarBorderSize);
                        break;
                    case 'first':
                        bar.attr('stroke-width', !serieIdx ? BAR_SETTINGS.BarBorderSize : 0);
                        break;
                    case 'second':
                        bar.attr('stroke-width', serieIdx ? BAR_SETTINGS.BarBorderSize : 0);
                        break;
                    default:
                        break;
                }

                let yMax = Y_AXIS_SETTINGS.MaxValue;

                // find local max
                let localRange = this.getRange().max;

                // set primary y axis min/max values
                y0.domain([0, yMax ? yMax : localRange * LAYOUT_SETTINGS.YScaleFactor]);
                yAxisG.call(yAxis)
                    .call(setYAxisGAttr);

                // removes 0 label
                d3.select('.y-axis-g > .tick')
                    .filter(d => d == 0)
                    .remove();

                // set secondary y axis
                y1.domain([minVal, maxVal ? maxVal : localRange * LAYOUT_SETTINGS.YScaleFactor]);
                secYAxisG.call(secYAxis)
                    .call(setSecYAxisGAttr);

                // removes 0 label
                d3.select('.sec-y-axis-g > .tick')
                    .filter(d => d == 0)
                    .remove();

                // removes border
                d3.selectAll('.domain').remove();

                // sets x position
                let setBarX = data => {
                    // sets position for value bars
                    if (serieIdx) {
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
                    } 
                    // sets position for target bars
                    else {
                        return x(data.data.sharedAxis.toString());
                    }
                }

                let barWidth = serieIdx ? x.bandwidth() * BAR_SETTINGS.BarPadding : x.bandwidth();

                // user has ability to select column(s) and serie(s), and manually adjust the bar height
                // gets selected bars
                let barsSelected = [];
                currSeries(serieIdx).BarSelect.split(',').forEach(s => barsSelected.push(s.trim()));

                // set bar properties
                bar.attr('x', data => setBarX(data))
                    .attr('width', barWidth)
                    .attr('y', height)
                    .attr('transform', 'rotate(180)')
                    .attr('transform-origin', data => `${setBarX(data) + barWidth / 2} ${height}`);

                if (barsSelected[0]) { // if column is selected
                    // calls function for every bar
                    bar.attr('height', (data, idx) => {
                        // converts selected bar(s) into an index
                        let selectedIdx = [];
                        barsSelected.forEach(b => selectedIdx.push(this.getIndex(b)));

                        // if current bar is one of the selected bars
                        if (selectedIdx.indexOf(idx) > -1) {
                            // return adjusted bar height
                            return y0(data[0]) + TARGET_SERIES.BarHeightAdjustment - y0(data[1]) + VALUE_SERIES.BarHeightAdjustment;
                        }
                        // return normal bar height
                        return y0(data[0]) - y0(data[1]);
                    });

                } else {
                    // normal bar height
                    bar.attr('height', data => y0(data[0]) - y0(data[1]));
                }

                let hoverBar = function (data) {
                    let selected = d3.select(this);
                    let serie: string = selected.attr('serie');
                    let xIdxAttr: string = selected.attr('xIdx');
                    let xIdx: number = -1;

                    try {
                        xIdx = parseInt(xIdxAttr);
                    }
                    catch (e) {
                        // error converting xidx 
                        console.error(e);
                        return;
                    }

                    if (xIdx == -1) {
                        return;
                    }

                    let xValue = null;
                    try {
                        xValue = dp.D3Data[xIdx].sharedAxis;
                    }
                    catch (e) {
                        // error getting d3data -- index out of bounds or undefined
                        console.error(e);
                        return;
                    }

                    let eventTarget: HTMLElement = d3.event.target;
                    if (!eventTarget) {
                        console.error('Unable to get event target');
                        return;
                    }
                    let eventBounds = eventTarget.getBoundingClientRect()
                    let posX = eventBounds.x;
                    let posY = eventBounds.y;
                    let padding = 10;

                    hoverInfoDiv.transition()
                        .duration(400)
                        .style('display', 'block')
                        .style('opacity', 1)
                        .style('background-color', 'grey')
                        .style('padding', padding + 'px');

                    let summaryText = '';

                    // reverse to match order of bars
                    Object.keys(data.data).reverse().forEach(key => {
                        if (key != 'sharedAxis') {
                            let text = key + ': ' + nFormatter(data.data[key], displayDigits, displayUnits) + '<br>';
                            if (key == serie) {
                                text = '<u>' + text + '</u>';
                            }
                            summaryText += text;
                        }
                        else {
                            summaryText += '<br>'
                        }
                    });

                    // text
                    hoverInfoDiv.html(
                        data.data.sharedAxis +
                        `<br>` +
                        summaryText
                    );

                    let xPosOffset = x.bandwidth() * 1.5;
                    if (xIdx > (dp.D3Data.length * (2 / 3))) {
                        xPosOffset = - hoverInfoDiv.node().offsetWidth - (x.bandwidth() / 2);
                    }
                    posX += xPosOffset;

                    // get max top
                    let body: HTMLElement = <HTMLElement>d3.select('body').node();
                    let bodyHeight = body.getBoundingClientRect().height;
                    let maxTop = bodyHeight - hoverInfoDiv.node().offsetHeight;

                    hoverInfoDiv.style('left', posX + 'px')
                        .style('top', Math.min(posY, maxTop) + 'px');
                }

                // prevent duplicate growth bars
                if (VALUE_SERIES.ShowSerie) {
                    growthBarOn = serieIdx ? true : false;
                } else if (TARGET_SERIES.ShowSerie) {
                    growthBarOn = serieIdx ? false : true;
                }

                // draws red/green rectangles as growth indicators/growth bars
                if (GROWTH_BAR_SETTINGS.GrowthRectToggle && growthBarOn) {
                    // loop for each column
                    dp.D3Data.forEach((dataset, xId) => {
                        // gets data for both series
                        let data1 = dataset[dpSeries[0]];
                        let data2 = dataset[dpSeries[1]];

                        // ensures data not 0
                        if (data1 && data2) {
                            // calculates growth value
                            let growthValue = (1 - data1 / data2) * 100;

                            let getXPos = () => {
                                if (GROWTH_BAR_SETTINGS.AlignGrowthRect == 'left') {
                                    return x(dataset.sharedAxis);
                                } else {
                                    return x(dataset.sharedAxis) + x.bandwidth() * (1 - GROWTH_BAR_SETTINGS.GrowthRectWidth);
                                }
                            }

                            // draws rect
                            svg.append('rect')
                                .classed('growth-rect', true)
                                .attr('xIdx', xId)
                                .attr('fill', growthValue > 0 ? GROWTH_BAR_SETTINGS.PositiveGrowthColor : GROWTH_BAR_SETTINGS.NegativeGrowthColor)
                                .attr('width', x.bandwidth() * GROWTH_BAR_SETTINGS.GrowthRectWidth)
                                .attr('x', getXPos)
                                .attr('height', _ => {
                                    let data1Y = y0(data1);
                                    let data2Y = y0(data2);

                                    // growth bar position needs to be adjusted if bar heights have been manually shifted
                                    // note that in d3, coordinate grid starts from top left (0, 0), and downwards is positive y
                                    // x coordinates are still normal

                                    // if target series is selected
                                    if (TARGET_SERIES.BarSelect) {
                                        // loop through selected bars
                                        targetBarsSelected.forEach(barSelected => {
                                            let targetIdx = this.getIndex(barSelected);
                                            // if current bar is selected
                                            if (xId == targetIdx) {
                                                // adjust height
                                                data1Y -= TARGET_SERIES.BarHeightAdjustment;
                                            }
                                        });
                                    }
                                    // same as above
                                    if (VALUE_SERIES.BarSelect) {
                                        valueBarsSelected.forEach(barSelected => {
                                            let valueIdx = this.getIndex(barSelected);
                                            if (xId == valueIdx) {
                                                data2Y -= VALUE_SERIES.BarHeightAdjustment;
                                            }
                                        });
                                    }

                                    return Math.abs(data1Y - data2Y);
                                })
                                .attr('y', _ => {
                                    let yPos = y0(data2);

                                    // similar to before, bar y position needs to be adjusted if bar heights have been manually shifted

                                    if (growthValue > 0) {
                                        if (VALUE_SERIES.BarSelect) {
                                            // for each selected bar
                                            valueBarsSelected.forEach(barSelected => {
                                                let valueIdx = this.getIndex(barSelected);
                                                // adjust height if current index matches one of the selected bars
                                                if (xId == valueIdx) {
                                                    yPos -= VALUE_SERIES.BarHeightAdjustment;
                                                }
                                            });
                                        }
                                    } else {
                                        yPos = y0(data1);
                                    }

                                    // same as above
                                    if (TARGET_SERIES.BarSelect) {
                                        targetBarsSelected.forEach(barSelected => {
                                            let targetIdx = this.getIndex(barSelected);
                                            if (xId == targetIdx) {
                                                yPos -= TARGET_SERIES.BarHeightAdjustment;
                                            }
                                        });
                                    }

                                    return yPos;
                                });

                            let val = data1 - data2;
                            if (GROWTH_LABEL_SETTINGS.FlipSign) {
                                val *= -1;
                            }

                            let labelVal = nFormatter(val, GROWTH_LABEL_SETTINGS.DisplayDigits, GROWTH_LABEL_SETTINGS.DisplayUnits);

                            // displays growth label if label width does not exceed tolerance, and if the label is toggled on
                            if (GROWTH_LABEL_SETTINGS.LabelToggle &&
                                this.getTextWidth(labelVal, GROWTH_LABEL_SETTINGS) < x.bandwidth() * GROWTH_BAR_SETTINGS.GrowthRectWidth + GROWTH_LABEL_SETTINGS.LabelDisplayTolerance) {
                                // add text
                                svg.append('text')
                                    .attr('width', x.bandwidth() * GROWTH_BAR_SETTINGS.GrowthRectWidth)
                                    .attr('x', getXPos() + x.bandwidth() * GROWTH_BAR_SETTINGS.GrowthRectWidth / 2)
                                    .attr('y', _ => {
                                        let yPos = y0(data2);

                                        // same as before: positioning growth label depending on bar height
                                        if (growthValue > 0) {
                                            if (VALUE_SERIES.BarSelect) {
                                                valueBarsSelected.forEach(barSelected => {
                                                    let valueIdx = this.getIndex(barSelected);
                                                    if (xId == valueIdx) {
                                                        yPos -= VALUE_SERIES.BarHeightAdjustment;
                                                    }
                                                });
                                            }
                                        } else {
                                            yPos = y0(data1);
                                        }

                                        if (TARGET_SERIES.BarSelect) {
                                            targetBarsSelected.forEach(barSelected => {
                                                let targetIdx = this.getIndex(barSelected);
                                                if (xId == targetIdx) {
                                                    yPos -= TARGET_SERIES.BarHeightAdjustment;
                                                }
                                            });
                                        }

                                        if (GROWTH_LABEL_SETTINGS.LabelPosition == 'mid') {
                                            yPos += Math.abs(y0(data1) - y0(data2)) / 2;

                                        } else {
                                            yPos -= 10;
                                        }
                                        return yPos;
                                    })
                                    .attr('fill', GROWTH_LABEL_SETTINGS.FontColor)
                                    .attr('font-size', GROWTH_LABEL_SETTINGS.FontSize)
                                    .attr('font-family', GROWTH_LABEL_SETTINGS.FontFamily)
                                    .attr('text-anchor', 'middle')
                                    .attr('dominant-baseline', 'middle')
                                    .text(labelVal);
                            }
                        }

                    });

                    let growthRect = svg.selectAll('.growth-rect').data(serie);
                    growthRect.on('mouseover', hoverBar)
                        .on('mouseout', function (_) {
                            hoverInfoDiv.transition()
                                .duration(100)
                                .attr('width', 0)
                                .attr('height', 0)
                                .style('opacity', 0)
                        });

                }

                // show text if bar height allows and bar labels are toggled on
                if (currSeries(serieIdx).BarLabelToggle) {

                    // create label on each bar
                    let barLabel = svg.selectAll('.label')
                        .data(serie)
                        .enter()
                        .append('text')
                        .attr('width', x.bandwidth())
                        .attr('height', DATA_LABEL_SETTINGS.FontSize)
                        .attr('fill', serieIdx ? VALUE_SERIES.LabelFontColor : TARGET_SERIES.LabelFontColor) // color varies depending on series
                        .attr('font-size', DATA_LABEL_SETTINGS.FontSize)
                        .attr('font-family', DATA_LABEL_SETTINGS.FontFamily)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle');

                    let getLabelText = data => {
                        // gets data value
                        let val = data.data[dpSeries[serieIdx]];
                        if (!val) {
                            return {
                                value: null,
                                width: 0
                            }
                        }

                        // gets bar height
                        let barHeight = y0(data[0]) - y0(data[1]) + currSeries(serieIdx).BarHeightAdjustment;

                        // max allowable text width
                        let maxTextWidth = x.bandwidth() / dpSeries.length + DATA_LABEL_SETTINGS.LabelDisplayTolerance;

                        // formats value
                        val = nFormatter(val, displayDigits, displayUnits);

                        let textWidth = this.getTextWidth(val, DATA_LABEL_SETTINGS);

                        // if the text doesn't fit, return null
                        if (textWidth > maxTextWidth ||
                            barHeight <= DATA_LABEL_SETTINGS.FontSize) {
                            return {
                                value: null,
                                width: 0
                            }
                        }

                        return {
                            value: val,
                            width: textWidth
                        }
                    }

                    barLabel.text(data => getLabelText(data).value);

                    let labelPos = currSeries(serieIdx).BarLabelPosition;
                    // positions the label
                    if (labelPos == 'mid') {
                        barLabel.attr('x', data => setBarX(data) + (serieIdx ? x.bandwidth() * BAR_SETTINGS.BarPadding : x.bandwidth()) / 2) // sets bar x pos
                            .attr('y', (data, xId) => {
                                let yPos = y0(data[0]) - y0(data[1]);

                                // bar y pos needs to change if height has been manually set

                                if (VALUE_SERIES.BarSelect && serieIdx) { // if current series == value and bar select not empty
                                    valueBarsSelected.forEach(barSelected => {
                                        let valueIdx = this.getIndex(barSelected);
                                        // adjusts bar height if current bar is a selected bar
                                        if (xId == valueIdx) {
                                            yPos += VALUE_SERIES.BarHeightAdjustment;
                                        }
                                    });
                                }

                                // same as above
                                if (TARGET_SERIES.BarSelect && !serieIdx) { // if current series == target and bar select not empty
                                    targetBarsSelected.forEach(barSelected => {
                                        let targetIdx = this.getIndex(barSelected);
                                        if (xId == targetIdx) {
                                            yPos += TARGET_SERIES.BarHeightAdjustment;
                                        }
                                    });
                                }

                                // computes y pos of label and vertically centers it
                                // = height of chart - half y pos 
                                return height - yPos / 2;
                            });

                    } else if (labelPos == 'top') {
                        if (currSeries(serieIdx).LabelBgToggle) {
                            // background
                            let bgPadding = 4;
                            svg.selectAll('.labelBg')
                                .data(serie)
                                .enter()
                                .append('rect')
                                .attr('width', data => getLabelText(data).width + bgPadding)
                                .attr('height', DATA_LABEL_SETTINGS.FontSize + bgPadding / 2)
                                .attr('fill', currSeries(serieIdx).LabelBackgroundColor)
                                .attr('y', (data, xId) => {
                                    let yPos = y0(data[1] - data[0]) - 18;

                                    // same as above

                                    if (VALUE_SERIES.BarSelect) {
                                        valueBarsSelected.forEach(barSelected => {
                                            let valueIdx = this.getIndex(barSelected);
                                            if (xId == valueIdx) {
                                                yPos -= VALUE_SERIES.BarHeightAdjustment;
                                            }
                                        });
                                    }

                                    if (TARGET_SERIES.BarSelect) {
                                        targetBarsSelected.forEach(barSelected => {
                                            let targetIdx = this.getIndex(barSelected);
                                            if (xId == targetIdx) {
                                                yPos -= TARGET_SERIES.BarHeightAdjustment;
                                            }
                                        });
                                    }

                                    return yPos;
                                })
                                .attr('x', data => setBarX(data) + setBarX(data) / 2);
                        }

                        // set text and xy pos
                        barLabel.attr('x', data => setBarX(data) + (serieIdx ? x.bandwidth() * BAR_SETTINGS.BarPadding : x.bandwidth()) / 2)
                            .attr('y', (data, xId) => {
                                let yPos = y0(data[1] - data[0]) - 10;

                                // same as above

                                if (VALUE_SERIES.BarSelect && serieIdx) {
                                    valueBarsSelected.forEach(barSelected => {
                                        let valueIdx = this.getIndex(barSelected);
                                        if (xId == valueIdx) {
                                            yPos -= VALUE_SERIES.BarHeightAdjustment;
                                        }
                                    });
                                }

                                if (TARGET_SERIES.BarSelect && !serieIdx) {
                                    targetBarsSelected.forEach(barSelected => {
                                        let targetIdx = this.getIndex(barSelected);
                                        if (xId == targetIdx) {
                                            yPos -= TARGET_SERIES.BarHeightAdjustment;
                                        }
                                    });
                                }

                                return yPos;
                            });

                        // bring to front
                        barLabel.each(function () {
                            this.parentNode.appendChild(this);
                        });

                    } else {
                        barLabel.attr('x', data => setBarX(data) + (serieIdx ? x.bandwidth() * BAR_SETTINGS.BarPadding : x.bandwidth()) / 2)
                            .attr('y', height - 15);
                    }
                }

                bar = svg.selectAll('.bar');
                // get mouse hover
                bar.on('mouseover', hoverBar)
                    .on('mouseout', function (_) {
                        hoverInfoDiv.transition()
                            .duration(100)
                            .attr('width', 0)
                            .attr('height', 0)
                            .style('opacity', 0)
                    });
            }
        });

        // threshold
        if (LINE_SETTINGS.LineToggle) {
            // converts values from LineValues into coordinate points
            let lineValueArray = [];
            dp.LineValues.forEach(data => lineValueArray.push([
                x(data.sharedAxis.toString()),
                LINE_SETTINGS.LineAlign ? y1(data.value) : y0(data.value)
            ]));

            // draws line
            svg.append('path')
                .datum(lineValueArray)
                .classed('lineValues', true)
                .attr('fill', 'none')
                .attr('stroke', LINE_SETTINGS.LineColor)
                .attr('stroke-width', LINE_SETTINGS.LineThickness)
                .attr('d', d3.line()
                    .x(data => data[0] + x.bandwidth() / 2)
                    .y(data => data[1] - LINE_SETTINGS.LineOffsetHeight)
                );

            // sets line type
            if (LINE_SETTINGS.LineType == 'dashed') {
                svg.selectAll('.lineValues')
                    .attr('stroke-dasharray', '5,4');
            }
        }

        let heightOffset = PRIMARY_LINE_SETTINGS.LineOffsetHeight;

        let drawGrowthIndicators = (data1, data2, col1, col2, setting) => {
            // if data is not 0 - no point in rendering indicators for a column of 0s
            if (data1 && data2) {
                if (eval(setting + '_GROWTH_SETTINGS').DisplayLabel == 'top') {
                    try {
                        // initializes coordinate points based on bars selected
                        let growth1Y = y0(data1) - heightOffset;
                        let growth2Y = y0(data2) - heightOffset;

                        if (valueBarsSelected.indexOf(col2.sharedAxis) > -1) {
                            growth2Y -= VALUE_SERIES.BarHeightAdjustment;
                        }

                        if (valueBarsSelected.indexOf(col1.sharedAxis) > -1 && setting == 'SECONDARY') {
                            growth1Y -= VALUE_SERIES.BarHeightAdjustment;
                        } else if (targetBarsSelected.indexOf(col1.sharedAxis) > -1) {
                            growth1Y -= TARGET_SERIES.BarHeightAdjustment;
                        }

                        let growth1X, growth2X;
                        if (setting == 'SECONDARY') {
                            growth1X = x(col1.sharedAxis.toString()) + x.bandwidth() / 4;
                            growth2X = x(col2.sharedAxis.toString()) + x.bandwidth() / 4;
                        } else {
                            growth1X = x(col1.sharedAxis.toString());
                            growth2X = x(col2.sharedAxis.toString()) + x.bandwidth() / 2;
                        }

                        // sets x position to the center of the bar
                        growth1X += x.bandwidth() / 4;
                        growth2X += x.bandwidth() / 4;

                        let averageX = (growth1X + growth2X) / 2;

                        // represents top border of the chart (excluding legend and other labels), defaults to 0
                        let maxYPos = y0(y0.domain()[1]);

                        let yPos = maxYPos;
                        // gets y pos for label
                        if (!eval(setting + '_GROWTH_SETTINGS').AlignIndicators && setting != 'SECONDARY') {
                            yPos = Math.min(growth1Y, growth2Y) - eval(setting + '_LABEL_SETTINGS').LabelHeight * 2

                            // ensures yPos does not exceed max, though technically max is actually a min
                            yPos = yPos > maxYPos ? yPos : maxYPos;

                            yPos -= eval(setting + '_GROWTH_SETTINGS').LabelYOffset;
                        }

                        // draw line
                        let path = d3.line()([
                            [growth1X, growth1Y],
                            [growth1X, yPos],
                            [growth2X, yPos],
                            [growth2X, growth2Y]]);

                        this.drawLine(path, 'growthLineValues', eval(setting + '_LINE_SETTINGS'));

                        // sets line type
                        if (eval(setting + '_LINE_SETTINGS').LineType == 'dashed') {
                            svg.selectAll('.growthLineValues')
                                .attr('stroke-dasharray', '5,4');
                        }

                        // calculate label text
                        let growthValue;

                        if (BAR_SETTINGS.FlipSeries) {
                            growthValue = (1 - data2 / data1) * 100;

                            if (eval(setting + '_LABEL_SETTINGS').FlipCalculation) {
                                growthValue = (data2 / data1) * 100
                            }
                        } else {
                            growthValue = (1 - data1 / data2) * 100;

                            if (eval(setting + '_LABEL_SETTINGS').FlipCalculation) {
                                growthValue = (data1 / data2) * 100;
                            }
                        }

                        if (eval(setting + '_LABEL_SETTINGS').FlipCalculation) {
                            growthValue = (data1 / data2) * 100
                        }

                        growthValue = eval(setting + '_LABEL_SETTINGS').ShowSign ? growthValue : Math.abs(growthValue);
                        let growthValueRounded = Math.round(growthValue * 10) / 10 + '%';

                        // draw label background shape
                        this.drawEllipse(averageX, yPos, growthValueRounded.toString(), eval(setting + '_LABEL_SETTINGS'));

                        // draw label text
                        this.drawText(averageX, yPos, eval(setting + '_LABEL_SETTINGS'), growthValueRounded.toString());

                        switch (eval(setting + '_LINE_SETTINGS').DisplayArrow) {
                            case 'left':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, eval(setting + '_LINE_SETTINGS'), 60);
                                break;

                            case 'right':
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, eval(setting + '_LINE_SETTINGS'), 60);
                                break;

                            case 'both':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, eval(setting + '_LINE_SETTINGS'), 60);
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, eval(setting + '_LINE_SETTINGS'), 60);
                                break;

                            default:
                                break;
                        }
                    } catch (e) {
                        this.container.innerHTML = 'Unable to create ' + setting.toLowerCase() + ' growth labels';
                    }

                } else if (eval(setting + '_GROWTH_SETTINGS').DisplayLabel == 'side') {
                    try {
                        // initializes coordinate points based on bars selected
                        let growth1Y = y0(data1);
                        let growth2Y = y0(data2);

                        if (valueBarsSelected.indexOf(col2.sharedAxis) > -1) {
                            growth2Y -= VALUE_SERIES.BarHeightAdjustment;
                        }

                        if (valueBarsSelected.indexOf(col1.sharedAxis) > -1 && setting == 'SECONDARY') {
                            growth1Y -= VALUE_SERIES.BarHeightAdjustment;
                        } else if (targetBarsSelected.indexOf(col1.sharedAxis) > -1) {
                            growth1Y -= TARGET_SERIES.BarHeightAdjustment;
                        }

                        let averageY = (growth2Y + growth1Y) / 2;

                        // calculates starting x positions for line, defaults to right corner of bar
                        let growth1X = x(col1.sharedAxis.toString());
                        let growth2X = x(col2.sharedAxis.toString());

                        // calculates x pos for label
                        let xPos = Math.min(growth2X, growth1X) - eval(setting + '_GROWTH_SETTINGS').LabelXOffset;
                        // ensures x pos does not exceed width
                        xPos = xPos < 0 ? 0 : xPos;

                        let arrowRotation = -30;

                        if (eval(setting + '_GROWTH_SETTINGS').DisplaySide == 'right') {
                            // adds offset to account for bar width
                            growth1X += x.bandwidth();
                            growth2X += x.bandwidth() * BAR_SETTINGS.BarPadding;

                            // gets desired x position
                            xPos = Math.max(growth2X, growth1X) + eval(setting + '_GROWTH_SETTINGS').LabelXOffset;
                            // ensures x pos does not exceed width
                            xPos = xPos < trueWidth ? xPos : trueWidth;

                            arrowRotation = 30;
                        }

                        // draw line
                        let path = d3.line()([
                            [growth1X, growth1Y],
                            [xPos, growth1Y],
                            [xPos, growth2Y],
                            [growth2X, growth2Y]]);

                        this.drawLine(path, 'growthLineValues', eval(setting + '_LINE_SETTINGS'));

                        // sets line type
                        if (eval(setting + '_LINE_SETTINGS').LineType == 'dashed') {
                            svg.selectAll('.growthLineValues')
                                .attr('stroke-dasharray', '5,4');
                        }

                        // calculate label text
                        let growthValue;

                        if (BAR_SETTINGS.FlipSeries) {
                            growthValue = (1 - data2 / data1) * 100;

                            if (eval(setting + '_LABEL_SETTINGS').FlipCalculation) {
                                growthValue = (data2 / data1) * 100
                            }
                        } else {
                            growthValue = (1 - data1 / data2) * 100;

                            if (eval(setting + '_LABEL_SETTINGS').FlipCalculation) {
                                growthValue = (data1 / data2) * 100;
                            }
                        }

                        growthValue = eval(setting + '_LABEL_SETTINGS').ShowSign ? growthValue : Math.abs(growthValue);
                        let growthValueRounded = Math.round(growthValue * 10) / 10 + '%';

                        // draw label background shape
                        this.drawEllipse(xPos, averageY, growthValueRounded.toString(), eval(setting + '_LABEL_SETTINGS'));

                        // draw label text
                        this.drawText(xPos, averageY, eval(setting + '_LABEL_SETTINGS'), growthValueRounded.toString());

                        switch (eval(setting + '_LINE_SETTINGS').DisplayArrow) {
                            case 'left':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, eval(setting + '_LINE_SETTINGS'), arrowRotation);
                                break;

                            case 'right':
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, eval(setting + '_LINE_SETTINGS'), arrowRotation);
                                break;

                            case 'both':
                                // draw first arrow
                                this.drawTriangle(growth1X, growth1Y, eval(setting + '_LINE_SETTINGS'), arrowRotation);
                                // draw second arrow
                                this.drawTriangle(growth2X, growth2Y, eval(setting + '_LINE_SETTINGS'), arrowRotation);
                                break;

                            default:
                                break;
                        }
                    } catch (e) {
                        this.container.innerHTML = 'Unable to create ' + setting.toLowerCase() + ' growth labels';
                    }
                }
            }
        }

        // draw primary growth indicators
        if (dpSeries.length > 1 &&
            PRIMARY_GROWTH_SETTINGS.TogglePrimaryIndicators) {

            let primarySelectors = PRIMARY_GROWTH_SETTINGS.Selector;
            let primSel = [];

            primarySelectors.split(',').forEach(s => primSel.push(s.trim()));

            if (primSel[0]) {
                primSel.forEach(selector => {
                    if (selector) {
                        let col = dp.D3Data[this.getIndex(selector)]
                        let data1 = col[dpSeries[0]];
                        let data2 = col[dpSeries[1]];

                        drawGrowthIndicators(data1, data2, col, col, 'PRIMARY');
                    }
                });
            } else {
                dp.D3Data.forEach(dataset => {
                    // gets corresponding serie data based on selectors
                    let data1 = dataset[dpSeries[0]];
                    let data2 = dataset[dpSeries[1]];

                    drawGrowthIndicators(data1, data2, dataset, dataset, 'PRIMARY');
                });
            }
        }

        // adds secondary growth indicator
        if (SECONDARY_GROWTH_SETTINGS.ToggleSecondaryIndicator) {

            // creates default selector, sets to most recent non-zero column
            let lastIdx = dp.D3Data.length - 1;
            let lastVal = 0;

            // iterates over columns starting from last column, returns first-from-last non-zero column
            while (lastIdx >= 0) {
                lastVal = dp.D3Data[lastIdx][dpSeries[1]];
                if (lastVal)
                    break;

                lastIdx--;
            }

            // finds equivalent growth selector for returned non-zero column
            let lastSelect = dp.D3Data[lastIdx].sharedAxis;

            // get growth selectors
            let select1 = SECONDARY_GROWTH_SETTINGS.Selector1;
            let select2 = SECONDARY_GROWTH_SETTINGS.Selector2;

            // define serie index and sum
            let growth2Val = 0;
            let growth2Idx = -1;

            // finds second growth selector if growth selector is specified, otherwise, use default value
            if (select2) {
                growth2Idx = this.getIndex(select2);
                growth2Val = dp.D3Data[growth2Idx][dpSeries[1]];

            } else {
                growth2Idx = lastIdx;
                growth2Val = lastVal;
                select2 = lastSelect;
            }

            let growth1Val = 0;
            let growth1Idx = -1;

            // finds first growth selector
            if (select1) {
                growth1Idx = this.getIndex(select1);
                growth1Val = dp.D3Data[growth1Idx][dpSeries[1]];

            } else {
                growth1Idx = --lastIdx;

                // gets first non-zero column
                while (growth1Idx >= 0) {
                    growth1Val = dp.D3Data[growth1Idx][dpSeries[1]];
                    if (growth1Val)
                        break;

                    growth1Idx--;
                }
                // sets selector
                select1 = dp.Columns[growth1Idx];
            }

            drawGrowthIndicators(growth1Val, growth2Val, dp.D3Data[growth1Idx], dp.D3Data[growth2Idx], 'SECONDARY');
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
            this.parent.innerHTML = 'Invalid selector';
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
    return parseFloat((num / si[i].value).toFixed(digits)).toLocaleString() + si[i].symbol;
}