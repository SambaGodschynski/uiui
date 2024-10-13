export interface IUiUiRootDef extends IUiUiElementDef {
    "line-comment-char": string;
    outfile: string;
    template?: string;
}

export interface IUiUiElementDef {
    id?: string;
    children?: IUiUiElementDef[];
    title: string;
    render: string;
    placeholder?: string;
}