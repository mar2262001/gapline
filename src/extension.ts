'use strict';
import * as vscode from 'vscode';

/*Este método se llama cuando sucede un evento de activación de la extensión
esta se activa cuando se ejecuta el comando (gapline)*/
export function activate(context: vscode.ExtensionContext) {
	/*Se crea una variable con el nombre 'disposable' que contendrá la definición de nuestra extensión
    después se vincula el identificador único 'gapline' a una función de controlador de extensión para crear 
    un nuevo comando con ese id, La función del controlador se invocará cada vez que 'gapline' 
    ejecute el comando, ya sea mediante programación con executeCommand, desde la interfaz de usuario 
    de VS Code o mediante una combinación de teclas*/
	let disposable = vscode.commands.registerCommand('gapline', () => {
		/*Se instancia el editor de texto activo al momento de ejecutar la extensión en una variable para
        poder manipularla*/
		var editor = vscode.window.activeTextEditor;
		/*Se comprueba si el editor de texto existe, si la variable es undefined quiere decir que no esta 
        abierto y por ende no se puede continuar, la ejecución termina con un retorno sin ejecutar nada mas*/
		if (!editor) { return; }
		/*Se guarda la referencia la propiedad selection del editor de texto en la variable 'selection'*/
		var selection = editor.selection;
		/*Se obtiene el texto seleccionado del editor activo de la variable selection y se guarda en la variable
        'text'*/
		var text = editor.document.getText(selection);
		/*Se lanza un cuadro de dialogo para que el usuario ingrese algún valor, se le manda como parámetro un 
        arreglo (de tipoInputBoxOptions) key value con las propiedades de configuración en este caso el valor que 
        queremos que aparezca en el prompt si el cuadro de dialogo es cancelado (SCAPE) devuelve undefined de lo 
        contrario devuelve el valor en cadena que ingrese el usuario (enter)*/
		vscode.window.showInputBox({ prompt: 'Lineas?' }).then(value => {
			/*Se recupera el valor capturado por el usuario (value) y se intenta incrementar en 1, si el valor es 
            diferente a un número devolverá NaN*/
			let numberOfLines = +value;
			/*Se declara un arreglo (textInChunks) de tipo string de una dimensión y vacío*/
			var textInChunks: Array<string> = [];
			/*El texto seleccionado se descomponen en un arreglo usando como carácter separador un salto de línea 
            (\n) para después recorre cada uno de sus índices donde 'currentLine' es la línea guardada en ese índice y 
            'lineIndex' es el índice de la iteración del forEach*/
			text.split('\n').forEach((currentLine: string, lineIndex) => {
				/*Se guarda la línea obtenida en la primera iteración (currentLine) en el arreglo 'textInChunks'*/
				textInChunks.push(currentLine);
				/*Si el residuo entre el número de renglón + 1 y el número de filas capturado por el usuario da 0 se inserta 
                al arreglo (textInChunks) un nuevo valor con un salto de línea esto garantiza que queden bloques según el numero 
                de lianas que configuro el usuario en la entrada de texto*/
				if ((lineIndex+1) % numberOfLines === 0) {textInChunks.push('');}
            });
			/*A la variable texto se le asigna el valor de todos los valores guardados en el arreglo 'textInChunks' separados
            por un salto de línea*/
			text = textInChunks.join('\n');
			/*Se inicia la edición del editor de texto para mostrar el texto formateado*/
			editor.edit((editBuilder) => {
				/*Se crea un rango donde se define la línea donde se inicia el rango en este caso será la primera
                línea de la selección de texto del usuario, después se define el primer carácter que tomara que
                en este caso será el primer carácte de la línea de selección del usuario, después se define la ultima
                línea del rango que este caso será la última línea de la selección del usuario y al final se define 
                el ultimo carácter que tomara en este caso será el último carácter de la última línea de la selección del usuario*/
				var range = new vscode.Range(
					selection.start.line, 0,
					selection.end.line,
					editor.document.lineAt(selection.end.line).text.length
				);
				/*después se define remplazar el rango definido por el arreglo que ya está formateado (contiene los
                espacios cada cierto número de líneas)*/
				editBuilder.replace(range, text);
			});
		});
	});
	/*Se suscribe el evento al contexto para poder ser utilizado*/
	context.subscriptions.push(disposable);
}

/*Este método se llama cuando su extensión está desactivada, en este ejercicio no se requiere funcionalidad en este evento*/
export function deactivate() {}