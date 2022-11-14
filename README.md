#### Emilio Martin Rodríguez Torres
##### 22/11/2022

![Image text](https://i.ibb.co/RQ3n3Rz/unir.png "UNIR")

## Computación en el cliente Web

### Creación de una extensión para Visual Studio Code
___

### Contenido

1. [Objetivo general](#1)
2. [Objetivos específicos](#2)
3. [Instalación de yeomman y generator-code](#3)
4. [Creando el esqueleto del proyecto](#4)
5. [Configurando un par de archivos antes de desarrollar la extensión](#5)
    1. [El archivo Tsconfig.ts](#51)
    2. [El archivo package.json](#52)
    3. [El archivo .eslintrc.json (opcional)](#53)
6. [¡Manos a la obra!, codificando la extensión](#6)
7. [Las funciones y propiedades específicas de las extensiones de VS Code (activate, deactivate*, etc)](#7)
    1. [activate](#71)
    2. [vscode.commands.registerCommand](#72)
    3. [vscode.window.activeTextEditor](#73)
    4. [vscode.window.activeTextEditor.document.getText](#74)
    5. [vscode.window.showInputBox](#75)
    6. [vscode.window.activeTextEditor.edit](#76)
    7. [vscode.Range](#77)
    8. [context.subscriptions.push](#78)
    9. [deactivate](#79)
8. [Elementos de TypeScript](#8)
    1. [Uso de interfaces](#81)
    2. [Tipado fuerte](#82)
9. [Probando nuestra extensión](#9)
11. [Link del proyecto](#10)
11. [Referencias](#11)
___

<a name="1"></a>
-  **Objetivo general**

    * En este ejercicio proponemos crear una extensión para el conocidísimo editor de texto de Microsoft: Visual Studio Code (**VS Code**). Esta extensión va a hacer una cosa muy sencilla: insertar una línea en blanco cada N líneas.

<a name="2"></a>
- **Objetivos específicos**

    * El objetivo es practicar la programación en Javascript (y conocer de paso TypeScript) y aplicarlo de manera novedosa. De manera paralela, vamos a trabajar con otras tecnologías modernas muy usadas hoy en día en el desarrollo web, tales como generadores y gestores de paquetes.

<a name="3"></a>
- **Instalación de yeomman y generator-code**
    * Yeoman es una aplicación para generar el esqueleto inicial de un proyecto web. Utiliza a su vez generadores para cada tipo de proyecto (web estáticas, páginas que usen jQuery, programas basados en Node, etc.). Yeoman está escrito, a su vez, en JavaScript.

      ``` npm install -g yo generator-code typescript```

      ![Image](https://i.ibb.co/QNSzX6Q/intalacion-Yeomman.jpg)


<a name="4"></a>
- **Creando el esqueleto del proyecto**

    * Para empezar, genera el esqueleto del proyecto con Yeoman (comando yo, que deberías ya tener a tu disposición por el simple hecho de haber instalado el paquete yo).

      ```yo code```

    * Con la opción code le estamos indicando a Yeoman que queremos usar el generador de extensiones para VS Code (que hemos instalado previamente mediante el paquete generator-code). Al ejecutar este comando, Yeoman nos hará varias preguntas para configurar nuestro proyecto.

      ![Image](https://i.ibb.co/QMpPx4q/yo.jpg)

    * Elige TypeScript como tipo de lenguaje de desarrollo: New Extension (TypeScript).

      ![Image](https://i.ibb.co/6JcBjCL/New-Extencion-Type-Script.jpg)

    * Luego dale un nombre a la extensión (Line Gapper) y un identificador (gapline).

      ![Image](https://i.ibb.co/Mgb1Qw8/Name.jpg)

    * La opción de publisher name es por si vamos a publicar la extensión en el repositorio de extensiones de VS Code, pero nosotros no vamos a hacerlo, así que podéis elegir un nombre cualquiera. 

      ![Image](https://i.ibb.co/Y0Lf46B/webpack.jpg)
     
    * Por último, cuando se nos pregunte si queremos iniciar un repositorio Git, decimos que no (Git se utiliza para control de versiones, que no vamos a utilizar).

      ![Image](https://i.ibb.co/VxRQH8D/gitNo.jpg)

      ![Image](https://i.ibb.co/mJHwLpk/final-Estructura.jpg)

<a name="5"></a>
- **Configurando un par de archivos antes de desarrollar la extensión**
  <a name="51"></a>
  * **El archivo Tsconfig.ts**
    * En este es el archivo de configuración de trabajo para el transpilador de **TypeScript**, es de tipo **JSON** en el se pueden escribir decenas de configuraciones, para este proyecto solo desactivaremos compilerOptions.strict

      `"compilerOptions": { …, "strict": false,`

      ![Image](https://i.ibb.co/M9fSWFR/strict-False.jpg)


  <a name="52"></a>
  * **El archivo package.json**
    * En este archivo tiene como finalidad llevar el control de los paquetes instalados y asi poder optimizar la forma el como se generan las dependencias en el proyecto, también contiene información y configuración general del proyecto como nombre, version, etc. para este proyecto solo modificaremos algunas lineas que el generador de código coloca por defecto. 

      `activationEvents.onCommand:gapline`

      `contributes.commands.command:gapline`

      `contributes.commands.title:Line Gapper`

      ![Image](https://i.ibb.co/Bj1s4tf/package.jpg)

  <a name="53"></a>
  * **El archivo .eslintrc.json (opcional)**
    * En este archivo se configuran las reglas de revision de código es ocupado por ESLint que es una herramienta de **linting** el cual según su configuración nos permitirá mostrar directamente en el editor errores de sintaxis, buenas practicas, vulnerabilidades y mantener un estilo consistente en el proyecto, para este proyecto no es necesaria alguna configuración
<a name="6"></a>
* **¡Manos a la obra!, codificando la extensión**

    ```typescript
    //Se configura el compilador de de TypeScript para obligar a respetar reglas especifícas de tipado y getion de tipos.
    'use strict';
    //importa todo el modulo (*) 'vscode' y le coloca el alias vscode
    import * as vscode from 'vscode';

    /*Este método se llama cuando sucede un evento de activación de la extensión esta se activa cuando se ejecuta por primera vez el comando gapline*/
    export function activate(context: vscode.ExtensionContext) {
      /*Se crea una variable con el nombre 'disposable' que contendrá la definición de nuestra extensión después se agrega el identificador único 'gapline' (configurado en el archivo package.json) a la lista de comandos disponibles con ese id, la función del se invocará cada vez que el comando 'gapline' se ejecute, ya sea mediante programación con executeCommand, o desde la interfaz de usuario de VS Code o mediante una combinación de teclas*/
      let disposable = vscode.commands.registerCommand('gapline', () => {
        /*Se obtiene la instancia del editor de texto activo al momento de ejecutar la extensión y se almacena en una variable (editor) para poder ser manipulada*/
        var editor = vscode.window.activeTextEditor;
        /*Se comprueba si el editor de texto existe, si la variable es undefined quiere decir que no se puedo obtener la instancia del editor (no esta abierto el editor) y por ende no se puede continuar, la ejecución termina con un retorno sin ejecutar nada mas*/
        if (!editor) { return; }
        /*Se guarda la referencia la propiedad selection del editor de texto en la variable 'selection'*/
        var selection = editor.selection;
        /*Se obtiene el texto seleccionado del editor activo de la variable selection y se guarda en la variable 'text'*/
        var text = editor.document.getText(selection);
        /*Se lanza un cuadro de dialogo para que el usuario ingrese algún valor, se le manda como parámetro un objeto (de tipo InputBoxOptions) key, value con las propiedades de configuración, en este caso el valor que queremos que aparezca en el prompt, si el cuadro de dialogo es cancelado (esc) devuelve undefined de lo contrario devuelve el valor en cadena que ingreso el usuario (enter)*/
        vscode.window.showInputBox({ prompt: 'Lineas?' }).then(value => {
          /*Se recupera el valor capturado por el usuario (value) como es un dato de tipo string se convierte en number con operador unario +, si el valor es 
                diferente a un número devolverá NaN*/
          let numberOfLines = +value;
          /*Se declara un arreglo (textInChunks) de tipo string de una dimensión y vacío*/
          var textInChunks: Array<string> = [];
          /*El texto seleccionado se divide por cada salto de linea (/n) y se almacena en un arreglo con la función split para después recorrer el arreglo y obtener en cada iteración el valor guardado "currentLine" y su indice "lineIndex" dentro del arreglo*/
          text.split('\n').forEach((currentLine: string, lineIndex) => {
            /*Se almacena la línea obtenida en la iteración (currentLine) en el arreglo 'textInChunks'*/
            textInChunks.push(currentLine);
            /*Se valida si es necesario agregar el salto de linea según el valor ingresado por el usuario (numberOfLines) verificando el residuo entre el número de renglón + 1 (se suma uno por que los indices inician en 0) y el número de filas capturado por el usuario si da 0 entonces es el momento de insertar en el arreglo (textInChunks) un nuevo registro vació esto garantiza que queden bloques según el numero de lineas que configuro el usuario en la entrada de texto*/
            if ((lineIndex+1) % numberOfLines === 0) {textInChunks.push('');}
                });
          /*A la variable text se le asigna la cadena obtenida por de la unión de todos los valores de arreglo textInChunks pero entre cada valor se agrega un caracter salto de linea*/
          text = textInChunks.join('\n');
          /*Se inicia la edición del editor de texto para mostrar el texto formateado*/
          editor.edit((editBuilder) => {
            /*Se crea una instancia de de tipo range donde se define un rango en el editor donde se indica la línea donde se inicia el rango en este caso será la primera línea de la selección de texto del usuario, después se define el primer carácter que tomara que en este caso será el primer carácter de la línea de selección del usuario, después se define la ultima línea del rango que este caso será la última línea de la selección del usuario y al final se define el ultimo carácter que tomara en este caso será el último carácter de la última línea de la selección del usuario*/
            var range = new vscode.Range(
              //Se configura el número inicial de la linea
                        selection.start.line, 
                        //Se configura el número inicial de la columna
                        0,
                        //Se configura el número final de la linea
              selection.end.line,
                        //Se configura el número final de la columna
              editor.document.lineAt(selection.end.line).text.length
            );
            /*después se define remplazar todo lo que este en el rango definido anteriormente por el arreglo que ya está formateado (contiene los
                    espacios cada cierto número de líneas)*/
            editBuilder.replace(range, text);
          });
        });
      });
      /*Se subscribe a una lista de objetos que se puede desechar, esta adición garantiza la correcta limpieza que hace automáticamente VS Code, recordemos que "vscode.commands.registerCommand" devuelve un objeto desechable (disposable) para un mejor manejo de recursos */
      context.subscriptions.push(disposable);
    }

    /*Este método se llama cuando su extensión se desactivada, en este ejercicio no se requiere funcionalidad en este evento*/
    export function deactivate() {}

    ```
<a name="7"></a>
* **Las funciones y propiedades específicas de las extensiones de VS Code (activate, deactivate*, etc)*
    <a name="71"></a>
    *  `activate`
        *   Esta función default se invoca cada que la extension es activada, se define en la interfaz {@link Extension} de vscode.
    <a name="72"></a>
    *  `vscode.commands.registerCommand`
        *   Este vincula un identificador de comando a una función manejadora de la extensión
    <a name="73"></a>
    *  `vscode.window.activeTextEditor`
        *   Manejador del editor actualmente activo o undefined. El editor activo es el que actualmente tiene el foco o, cuando ninguno lo tiene, el que ha cambiado de entrada más recientemente.
    <a name="74"></a>
    *  `vscode.window.activeTextEditor.document.getText`
        *   Obtiene el texto del documento en el editor de texto activo. Una sub cadena se puede recuperar proporcionando un rango.
    <a name="75"></a>
    *  `vscode.window.showInputBox`
        *   Abre un cuadro de entrada para pedirle al usuario que ingrese. El valor devuelto será undefined si se canceló el cuadro de entrada (por ejemplo, presionando ESC). De lo contrario, el valor devuelto será la cadena escrita por el usuario o una cadena vacía si el usuario no escribió nada pero desechó el cuadro de entrada con Aceptar.
    <a name="76"></a>
    *  `vscode.window.activeTextEditor.edit`
        *   Realice una edición en el documento asociado con este editor de texto. La función se invoca con un generador de edición que debe usarse para realizar ediciones. 
    <a name="77"></a>
    *  `vscode.Range`
        *   Un rango representa un par ordenado de dos posiciones. Los objetos de rango son inmutables 
    <a name="78"></a>
    *  `context.subscriptions.push`
        *   Una matriz a la que se pueden agregar desechables (disposable). Cuando se desactive esta extensión, se desecharán los desechables.
    <a name="79"></a>
    *  `deactivate`
        *   Función default que es invocada cada que la extension es desactivada, se define en la interfaz {@link Extension} de vscode.
<a name="8"></a>
* **Elementos de TypeScript**
  <a name="81"></a>
  * **Uso de interfaces**
    * El uso de interfaces usadas para definir métodos y propiedades abstrayéndose de su implementación es una de las ventajas de usar TypeScript en este caso el archivo index.d.ts es donde se encuentran declaradas.
  <a name="82"></a>
  * **Tipado fuerte**
    * El tipado fuerte nos permite tener un control y estructura sobre nuestros proyectos evitando posibles errores aunque puede que el desarrollo se vuelva un poco mas complejo en proyectos grandes es mejor optar por lenguajes de este tipo.
  
  En definitiva el uso de interfaces y tipado vuelve al lenguaje mas seguro en contraparte lo vuelve mas complejo tanto de configurar como de desarrollar.

<a name="9"></a>
* **Probando nuestra extensión**
  * Para ejecutar la extensión, pulsa F5 (o la tecla función + F5, dependiendo de tu teclado y sistema) o selecciona la opción de menú Start debugging del menú Debug. Verás que se abre una nueva ventana de VS Code (que ya tiene tu extensión pre cargada). Abre un fichero de texto cualquiera, selecciona su contenido y pulsa control/comando + shift + P. Se abrirá el visor de comandos de VS Code. Busca el nombre de tu extensión (tendrá el mismo nombre que hayas puesto en el campo contributes -> commands -> title en el fichero package.json o el que le diste cuando la creaste con el generador de Yeoman). Debería aparecer un nuevo cuadro de diálogo preguntándote cada cuántas líneas quieres insertar: una línea en blanco (o el texto que hayas puesto en la propiedad prompt del código anterior). Selecciona un número apropiado y pulsa entrar. Verás cómo el texto seleccionado es sustituido por uno nuevo, pero que contiene líneas en blanco.

    ![Image](https://i.ibb.co/L86KKWw/Depurar-Extencion.jpg)
    ![Image](https://i.ibb.co/HCRSJT7/Debug.jpg)
    ![Image](https://i.ibb.co/nz8c7xP/show-Input-Box.jpg "Depurara 1")
    ![Image](https://i.ibb.co/qCBbmyS/funcionando.jpg)

<a name="10"></a>
* **Link del proyecto**

    * [github.com](https://github.com/mar2262001/gapline)

<a name="11"></a>
* **Referencias**

  * [tsconfig](https://www.typescriptlang.org/tsconfig)
  * [VS Code api](https://code.visualstudio.com/api/references/vscode-api)
  * [visual studio extensions](https://learn.microsoft.com/es-es/visualstudio/ide/finding-and-using-visual-studio-extensions?view=vs-2022)
  * [VS Code](https://code.visualstudio.com/)
  * [extension-gallery](https://code.visualstudio.com/docs/editor/extension-gallery)
  * [typescriptlang](http://www.typescriptlang.org/)
  * [typescript-summary](https://github.com/lakshaydulani/typescript-summary)
  * [Node](https://nodejs.org/en/download/current/)
  * [NPM](https://www.npmjs.com/)
  * [REPL](https://es.wikipedia.org/wiki/REPL)
  * [Yeoman](https://yeoman.io/)
  * [Generator Code](https://www.npmjs.com/package/generator-code)
  * [Transpilador](https://en.wikipedia.org/wiki/Source-to-source_compiler)
  * [Git](https://git-scm.com/)
