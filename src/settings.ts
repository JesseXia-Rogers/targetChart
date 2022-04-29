/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export class VisualSettings extends DataViewObjectsParser {
    public XAxisSettings: XAxisSettings = new XAxisSettings();
    public YAxisSettings: YAxisSettings = new YAxisSettings();
    public DataLabelSettings: DataLabelSettings = new DataLabelSettings();
    public LayoutSettings: LayoutSettings = new LayoutSettings();
    public PatternSettings: PatternSettings = new PatternSettings();
    public BarSettings: BarSettings = new BarSettings();
    public GrowthBarSettings: GrowthBarSettings = new GrowthBarSettings();
    public GrowthLabelSettings: GrowthLabelSettings = new GrowthLabelSettings();
    public TargetSeries: TargetSeries = new TargetSeries();
    public ValueSeries: ValueSeries = new ValueSeries();
    public LegendSettings: LegendSettings = new LegendSettings();
    public LineSettings: LineSettings = new LineSettings();
    public PrimaryGrowthSettings: PrimaryGrowthSettings = new PrimaryGrowthSettings();
    public PrimaryLabelSettings: PrimaryLabelSettings = new PrimaryLabelSettings();
    public PrimaryLineSettings: PrimaryLineSettings = new PrimaryLineSettings();
    public SecondaryGrowthSettings: SecondaryGrowthSettings = new SecondaryGrowthSettings();
    public SecondaryLabelSettings: SecondaryLabelSettings = new SecondaryLabelSettings();
    public SecondaryLineSettings: SecondaryLineSettings = new SecondaryLineSettings();
    public SecondaryYAxis: SecondaryYAxis = new SecondaryYAxis();
}

// initializes default values for all settings
// setting names here must correspond to capabilities.json, which defines all user-adjustable settings

export class LayoutSettings {
    public ChartXMargin: number = 85;
    public ChartTopMargin: number = 35;
    public ChartBottomMargin: number = 35;

    public XAxisBarWhiteSpace: number = 0.3;
    public YScaleFactor: number = 1.3;
}

// pattern fill for target bars
export class PatternSettings {
    public PatternToggle: boolean = false;
    public PatternColor: string = '#D9D9D9';
    public PatternType: string = 'stripes';
    public PatternUnitSize: string = 'medium';
}

export class BarSettings {
    public BarAlignment: string = 'center';
    public BarPadding: number = 0.7;

    public DisplayBarBorder: string = 'first';
    public BarBorderSize: number = 2;
    public BarBorderColor: string = '#B3B3B3';
    public BarBorderLineType: string = 'solid';

    public FlipSeries: boolean = false;
}

export class LineSettings {
    public LineToggle: boolean = true;
    public LineOffsetHeight: number = 0;
    public LineAlign: boolean = false;
    public LineThickness: number = 1;
    public LineColor: string = '#FF0000';
    public LineType: string = 'dashed';
}

export class XAxisSettings {
    public FontFamily: string = 'Calibri';
    public FontColor: string = '#666666';
    public FontSize: number = 10;

    public LabelAngle: number = 0;

    public XOffset: number = 0;
    public YOffset: number = 0;
}

export class YAxisSettings {
    public DisplayUnits: string = 'auto';
    public DisplayDigits: number = 1;

    public MaxValue: number = 0;

    public TickCount: number = 3;

    public ToggleGridLines: boolean = true;

    public FontFamily: string = 'Calibri';
    public FontColor: string = '#666666';
    public FontSize: number = 10;
}

export class SecondaryYAxis {
    public ToggleOn: boolean = true;

    public MinValue: number = 0;
    public MaxValue: number = 0;

    public DisplayUnits: string = 'auto';
    public DisplayDigits: number = 1;

    public TickCount: number = 3;

    public FontFamily: string = 'Calibri';
    public FontColor: string = '#666666';
    public FontSize: number = 10;
}

export class DataColors {
    public seriesFontColor: string = '#000000';
    public seriesColor: string = '#000000';
}

export class TargetSeries {
    public SerieColor: string = '#ffffff';

    public ShowSerie: boolean = true;
    public BarLabelToggle: boolean = true;
    public LabelBgToggle: boolean = false;
    public LabelFontColor: string = '#000000';
    public LabelBackgroundColor: string = '#ffffff';

    public BarLabelPosition: string = 'top';

    public BarSelect: string = '';
    public BarHeightAdjustment: number = 0;
}

export class ValueSeries {
    public SerieColor: string = '#B3B3B3';

    public ShowSerie: boolean = true;
    public BarLabelToggle: boolean = true;

    public LabelFontColor: string = '#000000';
    public LabelBgToggle: boolean = false;
    public LabelBackgroundColor: string = '#ffffff';

    public BarLabelPosition: string = 'top';
    
    public BarSelect: string = '';
    public BarHeightAdjustment: number = 0;
}

export class DataLabelSettings {
    public DisplayUnits: string = 'auto';
    public DisplayDigits: number = 1;

    public FontFamily: string = 'Calibri';
    public FontSize: number = 10;

    public LabelDisplayTolerance: number = 10;
}

export class LegendSettings {
    public LegendToggle: boolean = true;
    public LegendPosition: string = 'top';
    public LegendMargin: number = 0;

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 13;
}

export class GrowthBarSettings {        
    public GrowthRectToggle: boolean = true;
    public PositiveGrowthColor: string = '#2dcc4d';
    public NegativeGrowthColor: string = '#e31426';
    public AlignGrowthRect: string = 'left';
    public GrowthRectWidth: number = 0.2;
}

export class GrowthLabelSettings {
    public LabelToggle: boolean = true;
    public LabelPosition: string = 'top';

    public DisplayUnits: string = 'auto';
    public DisplayDigits: number = 1;

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 10;

    public LabelDisplayTolerance: number = 10;

    public FlipSign: boolean = false;
}

export class PrimaryGrowthSettings {
    public Selector: string = '';

    public TogglePrimaryIndicators: boolean = true;

    public DisplayLabel: string = 'side';
    public DisplaySide: string = 'right';

    public AlignIndicators: boolean = false;

    public LabelYOffset: number = 0;
    public LabelXOffset: number = 40;
}

export class PrimaryLabelSettings {
    public LabelBackgroundColor: string = '#ffffff';

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 11;

    public BorderColor: string = '#808080';
    public BorderSize: number = 1;

    public LabelHeight: number = 10;
    public LabelMinWidth: number = 20;

    public ShowSign: boolean = true;
    public FlipCalculation: boolean = false;

    public ToggleBgShape: boolean = true;
}

export class PrimaryLineSettings {
    public LineColor: string = '#808080';
    public LineOffsetHeight: number = 25;
    public LineSize: number = 1;
    public LineType: string = 'solid';

    public ArrowSize: number = 20;
    public DisplayArrow: string = 'both';
}

export class SecondaryGrowthSettings {
    public ToggleSecondaryIndicator: boolean = true;

    public Selector1: string = '';
    public Selector2: string = '';

    public DisplayLabel: string = 'top';
    public DisplaySide: string = 'right';

    public LabelXOffset: number = 40;
}

export class SecondaryLabelSettings {
    public LabelBackgroundColor: string = '#ffffff';

    public BorderColor: string = '#808080';
    public BorderSize: number = 1;

    public FontColor: string = '#000000';
    public FontFamily: string = 'Calibri';
    public FontSize: number = 11;

    public LabelHeight: number = 10;
    public LabelMinWidth: number = 20;

    public ShowSign: boolean = true;
    public FlipCalculation: boolean = false;

    public ToggleBgShape: boolean = true;
}

export class SecondaryLineSettings {
    public LineColor: string = '#808080';
    public LineOffsetHeight: number = 25;
    public LineType: string = 'solid';
    public LineSize: number = 1;

    public ArrowSize: number = 20;
    public DisplayArrow: string = 'both';
}
