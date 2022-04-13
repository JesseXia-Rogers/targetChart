import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;
export declare class VisualSettings extends DataViewObjectsParser {
    XAxisSettings: XAxisSettings;
    YAxisSettings: YAxisSettings;
    DataLabelSettings: DataLabelSettings;
    LayoutSettings: LayoutSettings;
    BarSettings: BarSettings;
    GrowthBarSettings: GrowthBarSettings;
    GrowthLabelSettings: GrowthLabelSettings;
    TargetSeries: TargetSeries;
    ValueSeries: ValueSeries;
    LegendSettings: LegendSettings;
    LineSettings: LineSettings;
    PrimaryGrowthSettings: PrimaryGrowthSettings;
    PrimaryLabelSettings: PrimaryLabelSettings;
    PrimaryLineSettings: PrimaryLineSettings;
    SecondaryGrowthSettings: SecondaryGrowthSettings;
    SecondaryLabelSettings: SecondaryLabelSettings;
    SecondaryLineSettings: SecondaryLineSettings;
    SecondaryYAxis: SecondaryYAxis;
}
export declare class LayoutSettings {
    ChartXMargin: number;
    ChartTopMargin: number;
    ChartBottomMargin: number;
    XAxisBarWhiteSpace: number;
    YScaleFactor: number;
}
export declare class BarSettings {
    BarAlignment: string;
    BarPadding: number;
    DisplayBarBorder: string;
    BarBorderSize: number;
    BarBorderColor: string;
    BarBorderLineType: string;
    FlipSeries: boolean;
}
export declare class LineSettings {
    LineToggle: boolean;
    LineOffsetHeight: number;
    LineAlign: boolean;
    LineThickness: number;
    LineColor: string;
    LineType: string;
}
export declare class XAxisSettings {
    FontFamily: string;
    FontColor: string;
    FontSize: number;
    LabelAngle: number;
    XOffset: number;
    YOffset: number;
}
export declare class YAxisSettings {
    DisplayUnits: string;
    DisplayDigits: number;
    MaxValue: number;
    TickCount: number;
    ToggleGridLines: boolean;
    FontFamily: string;
    FontColor: string;
    FontSize: number;
}
export declare class SecondaryYAxis {
    ToggleOn: boolean;
    MinValue: number;
    MaxValue: number;
    DisplayUnits: string;
    DisplayDigits: number;
    TickCount: number;
    FontFamily: string;
    FontColor: string;
    FontSize: number;
}
export declare class DataColors {
    seriesFontColor: string;
    seriesColor: string;
}
export declare class TargetSeries {
    SerieColor: string;
    ShowSerie: boolean;
    BarLabelToggle: boolean;
    LabelBgToggle: boolean;
    LabelFontColor: string;
    LabelBackgroundColor: string;
    BarLabelPosition: string;
}
export declare class ValueSeries {
    SerieColor: string;
    ShowSerie: boolean;
    BarLabelToggle: boolean;
    LabelFontColor: string;
    LabelBgToggle: boolean;
    LabelBackgroundColor: string;
    BarLabelPosition: string;
}
export declare class DataLabelSettings {
    DisplayUnits: string;
    DisplayDigits: number;
    FontFamily: string;
    FontSize: number;
    LabelDisplayTolerance: number;
}
export declare class LegendSettings {
    LegendToggle: boolean;
    LegendPosition: string;
    LegendMargin: number;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
}
export declare class GrowthBarSettings {
    GrowthRectToggle: boolean;
    PositiveGrowthColor: string;
    NegativeGrowthColor: string;
    AlignGrowthRect: string;
    GrowthRectWidth: number;
}
export declare class GrowthLabelSettings {
    LabelToggle: boolean;
    LabelPosition: string;
    DisplayUnits: string;
    DisplayDigits: number;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    LabelDisplayTolerance: number;
    FlipSign: boolean;
}
export declare class PrimaryGrowthSettings {
    Selector: string;
    TogglePrimaryIndicators: boolean;
    DisplayLabel: string;
    DisplaySide: string;
    AlignIndicators: boolean;
    LabelYOffset: number;
    LabelXOffset: number;
}
export declare class PrimaryLabelSettings {
    LabelBackgroundColor: string;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    BorderColor: string;
    BorderSize: number;
    LabelHeight: number;
    LabelMinWidth: number;
    ShowSign: boolean;
    FlipCalculation: boolean;
    ToggleBgShape: boolean;
}
export declare class PrimaryLineSettings {
    LineColor: string;
    LineOffsetHeight: number;
    LineSize: number;
    LineType: string;
    ArrowSize: number;
    DisplayArrow: string;
}
export declare class SecondaryGrowthSettings {
    ToggleSecondaryIndicator: boolean;
    Selector1: string;
    Selector2: string;
    DisplayLabel: string;
    DisplaySide: string;
    LabelXOffset: number;
}
export declare class SecondaryLabelSettings {
    LabelBackgroundColor: string;
    BorderColor: string;
    BorderSize: number;
    FontColor: string;
    FontFamily: string;
    FontSize: number;
    LabelHeight: number;
    LabelMinWidth: number;
    ShowSign: boolean;
    FlipCalculation: boolean;
    ToggleBgShape: boolean;
}
export declare class SecondaryLineSettings {
    LineColor: string;
    LineOffsetHeight: number;
    LineType: string;
    LineSize: number;
    ArrowSize: number;
    DisplayArrow: string;
}
