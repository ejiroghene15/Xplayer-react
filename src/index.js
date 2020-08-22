import React from "react";
import ReactDOM from "react-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "animate.css";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import AudioPlayer from "./audioctrl";
// import { silence } from "./model/kitty";

ReactDOM.render(
	<React.StrictMode>
		<AudioPlayer />
	</React.StrictMode>,
	document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();