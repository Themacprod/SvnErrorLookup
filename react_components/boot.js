/* global document:true */

import React from 'react';
import CreateReactClass from 'create-react-class';
import ReactDOM from 'react-dom';

const Boot = CreateReactClass({
    render: function () {
        return React.createElement(require('./app'));
    }
});

ReactDOM.render(React.createElement(Boot), document.getElementById('container'));
