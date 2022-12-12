import Chart from "chart.js/auto";
import { UI } from "./UI";

export class Plot {
    private static readonly MAX_DATAPOINTS = 20;
    private _chart: Chart

    constructor() {
        const debugContainer = document.getElementById("debug_container");
        if (!debugContainer) throw Error("unable to create chart");
        const chartCanvas = document.createElement("canvas");
        debugContainer.append(chartCanvas);
        const labels = [];
        for (let i = 0; i < Plot.MAX_DATAPOINTS; i++) {
            labels.unshift(-i);
        }
        this._chart = new Chart(chartCanvas,
            {
                type: "line",
                data: {
                    labels,
                    datasets: [
                        {
                            label: "Number of evaluated moves",
                            data: [],
                            tension: 0.2,
                            backgroundColor: UI.COLORS.filled,
                            borderColor: UI.COLORS.filled
                        }
                    ]
                },
                options: {
                    scales: {
                        y: {
                            type: "logarithmic",
                            min: 1
                        }
                    }
                }
            });
    }

    public logValue(value: number) {
        const dataset = this._chart.data.datasets[0].data;
        dataset.push(value);
        while (dataset.length < Plot.MAX_DATAPOINTS) {
            dataset.unshift(null);
        }
        while (dataset.length > Plot.MAX_DATAPOINTS) {
            dataset.shift();
        }
        this._chart.update("none");
    }
}