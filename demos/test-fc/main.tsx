import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
    const [num, setNumber] = useState(0);
    return (
        <div
            onClick={() => {
                setNumber((p) => p + 1);
            }}
        >
            {num}
        </div>
    );
}

function Child() {
    return <span>child</span>;
}

console.log(`React`, React);
console.log('ReactDOM', ReactDOM);
ReactDOM.createRoot(document.querySelector('#root')).render(<App />);
