import {createElement} from 'react';
import {hydrateRoot} from 'react-dom/client';
import {jm} from './app.js';
hydrateRoot(document.getElementById('root'),createElement(jm));
