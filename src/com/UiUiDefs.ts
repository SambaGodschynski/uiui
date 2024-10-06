export interface IUiUiRootDef extends IUiUiElementDef {
    comment: string,
    outfile: string,
}

export interface IUiUiElementDef {
    id?: string,
    children?: IUiUiElementDef[],
    title: string,
    render: string
}