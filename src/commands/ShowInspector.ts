import { ACommand } from "./ACommand";
import { UiUiView } from "../com/UiUiView";
import * as vscode from 'vscode';

export class ShowInspector extends ACommand {

	async execute(): Promise<void> {
		const view = new UiUiView(this.context);
		view.document = vscode.window.activeTextEditor!.document;
		await view.createPanel();
	}
}