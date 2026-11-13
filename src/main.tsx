import { render } from 'preact';
import { App } from './ui/App';
import './ui/styles/tokens.css';
import './ui/styles/app.css';

const root = document.getElementById('app');
if (root) render(<App />, root);
