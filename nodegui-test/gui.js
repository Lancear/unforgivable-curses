const qt = require("@nodegui/nodegui");
const Worker = require('worker_threads').Worker;

setup();
function setup() {
    const root = new qt.QBoxLayout(qt.Direction.TopToBottom);

    const label = new qt.QLabel();
    label.setAlignment(qt.AlignmentFlag.AlignCenter);
    root.addWidget(label);

    const rootWidget = new qt.QWidget();
    rootWidget.setLayout(root);

    globalThis.mainWindow = new qt.QMainWindow();
    mainWindow.setCentralWidget(rootWidget);
    mainWindow.show();

    const worker = new Worker('./clock.js');
    worker.on('message', (message) => label.setText(message));
}