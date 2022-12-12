

export class Debug {
    private static elements: {[id: string]: HTMLElement} = {}

    public static debugValue(name: string, value: string | number) {
        if(name in Debug.elements) {
            Debug.elements[name].innerText = value.toString();
            return;
        }

        const paragraph = document.createElement("p");
        const nameSpan = document.createElement("span");
        const valueSpan = document.createElement("span");

        nameSpan.innerText = `${name}: `;
        valueSpan.innerText = value.toString();

        paragraph.append(nameSpan, valueSpan);
        document.getElementById("debug_container")?.append(paragraph);

        this.elements[name] = valueSpan;
    }
}