import { ACommand } from "./ACommand";
import { InspectorView } from "../com/InspectorView";
import * as vscode from 'vscode';

export class ShowInspector extends ACommand {

	async execute(): Promise<void> {
		const view = new InspectorView(this.context);
		view.document = vscode.window.activeTextEditor!.document;
		await view.createPanel();
	}
}