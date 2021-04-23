const { useState } = React;

function App(props) {
  const [counter, setCounter] = useState(0);

  return HTML`
    <div>
      <h1>Clicked ${counter} times!</h1>
      <button onClick=${() => setCounter(counter + 1)}>click me</button>
    </div>
  `;
}

ReactDOM.render(HTML`<${App} />`, document.querySelector('#app'));
