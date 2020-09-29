import React, { Component } from "react";
import axios from "axios";
// axios.defaults.baseURL = "https://inexus.dev/react_app/xplayer/";
axios.defaults.baseURL = "http://localhost/tuts/";
const API = axios.defaults.baseURL;

class AudioPlayer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			playlist: [],
		};
		this.fetchSongs();
	}

	music_player = () => document.querySelector("#music_player");

	triggerUpload = () => document.querySelector("#upload_song").click();

	getMp3Data = async () => {
		let _audio = document.querySelector("#upload_song");
		let audio_files = _audio.files;
		let fd = new FormData();
		fd.append("action", "addsong");

		Array.from(audio_files).forEach(async (val, indx) => {
			let { name, type } = _audio.files[indx];
			if (type.match("audio/")) {
				fd.append(`${name}`, _audio.files[indx]);
			}
		});
		await this.saveSong(fd);
	};

	saveSong = async (song) => {
		axios.post(`song_controller.php`, song).then(({ data }) => {
			if (data.status == true) {
				this.updatePlaylist(data.songs);
			}
		});
	};

	fetchSongs = async () => {
		axios.get(`song_controller.php`).then(({ data }) => {
			if (data.status == true) {
				this.updatePlaylist(data.songs);
			}
		});
	};

	togglePlayer = (source) => {
		/*
		 * toggle the play and pause action when a song is clicked on
		 */
		const { src, paused } = this.music_player();
		if (src !== source) {
			this.music_player().src = source;
			this.music_player().play();
		} else {
			paused ? this.music_player().play() : this.music_player().pause();
		}
	};

	updatePlaylist = (songs) => {
		if (songs !== false) {
			this.setState({
				playlist: [...songs],
			});
		}
	};

	render() {
		const { playlist } = this.state;
		return (
			<React.Fragment>
				<button className="btn btn-sm btn-info" onClick={this.triggerUpload}>
					Upload Song
				</button>
				<input
					type="file"
					accept="audio/*"
					className="d-none"
					id="upload_song"
					multiple
					onChange={this.getMp3Data.bind(this)}
				/>
				<audio controls id="music_player" className="d-none"></audio>
				{playlist.length > 0 ? (
					<MusicList playlist={playlist} togglePlayer={this.togglePlayer} />
				) : null}
			</React.Fragment>
		);
	}
}

const MusicList = ({ playlist, togglePlayer }) => {
	let songDuration = (duration) => {
		duration = parseInt(duration);
		let hours = parseInt(duration / (60 * 60));
		let mins = parseInt((duration % (60 * 60)) / 60);
		let secs = parseInt(duration % 60);
		secs = secs < 10 ? `0${secs}` : secs;
		return (duration =
			hours > 0 ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`);
	};

	return (
		<React.Fragment>
			<div className="list-group animate__animated animate__fadeIn">
				{playlist.map(({ name, title, source, size, duration }, key) => (
					<div
						key={key}
						onClick={() => togglePlayer(`${API}${source}`)}
						className="list-group-item list-group-item-action "
					>
						<div className="d-flex flex-column">
							<div className="d-flex justify-content-between">
								<h6>{title}</h6>
								<small>{songDuration(duration)}</small>
							</div>
							<small>
								<b>{size} </b>
							</small>
						</div>
					</div>
				))}
			</div>
		</React.Fragment>
	);
};

export default AudioPlayer;
