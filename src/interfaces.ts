import powerbi from "powerbi-visuals-api";
import PrimitiveValue = powerbi.PrimitiveValue;
import ISelectionId = powerbi.visuals.ISelectionId;

// data process interfaces

export interface Range {
    min: number;
    max: number;
}

export interface Numeric {
    min: number;
    max: number;
    topRounded: number;
    interval: number;
};

// bar interfaces
export interface Dimension {
    width: number;
    height: number;
}

export interface BarChartDataPoint {
    value: PrimitiveValue;
    category: string;
    color: string;
    strokeColor: string;
    strokeWidth: number;
    selectionId: ISelectionId;
}

export interface DataPointSerie {
    value: PrimitiveValue;
    selection: ISelectionId;
}

export let MonthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];