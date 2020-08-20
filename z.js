import React, { Component } from "react";
import dexie from "dexie";

class AudioPlayer extends Component {
	constructor(props) {
		super(props);

		this.state = {
			playlist: [],
		};

		this.db.version(1).stores({
			song: "name, title, duration,  size, source",
		});

		this.db.open().then((db) => {
			this.fetchSongs();
		});
	}

	db = new dexie("playlist");

	al2 = () => document.querySelector("#al2");

	music_player = () => document.querySelector("#music_player");

	triggerUpload = () => document.querySelector("#upload_song").click();

	songDuration = (song) => {
		let duration = parseInt(song);
		let hours = parseInt(duration / (60 * 60));
		let mins = parseInt((duration % (60 * 60)) / 60);
		let secs = parseInt(duration % 60);
		secs = secs < 10 ? `0${secs}` : secs;
		return (duration =
			hours > 0 ? `${hours}:${mins}:${secs}` : `${mins}:${secs}`);
	};

	getMp3Data = () => {
		let _audio = document.querySelector("#upload_song");
		let audio_files = _audio.files;
		Array.from(audio_files).forEach((val, indx) => {
			let { name, type, size } = _audio.files[indx];
			if (type.match("audio/")) {
				size = size / 1000;
				size = Number.parseFloat(size / 1000).toPrecision(3) + " MB";
				name = name.slice(0, name.length - 4);
				let reader = new FileReader();
				reader.onload = async ({ target }) => {
					// Create an instance of AudioContext
					var audioContext = new (window.AudioContext ||
						window.webkitAudioContext)();
					// Asynchronously decode audio file data contained in an ArrayBuffer.
					audioContext.decodeAudioData(target.result, async ({ duration }) => {
						duration = this.songDuration(duration);
						await this.saveSong(name, name, duration, size, target.result);
					});
				};
				reader.readAsArrayBuffer(_audio.files[indx]);
			}
		});
	};

	saveSong = async (name, title, duration, size, source) => {
		await this.db.song
			.put({
				name,
				title,
				duration,
				size,
				source,
			})
			.then(() => this.fetchSongs());
	};

	fetchSongs = () => {
		this.db.song
			.reverse()
			.toArray()
			.then((playlist) => {
				if (playlist.length > 0) {
					this.setState({
						playlist: [...playlist],
					});
				}
				// ? rs: ready state
				const { readyState: mp_rs } = this.music_player();
				if (mp_rs === 0) {
					this.music_player().play();
				}
			});
	};

	togglePlayer = (source) => {
		const { src, paused } = this.music_player();
		if (src === source) {
			paused ? this.music_player().play() : this.music_player().pause();
		} else {
			this.music_player().src = source;
			this.music_player().play();
		}
	};

	render() {
		const { playlist } = this.state;
		return (
			<>
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
				<audio controls id="music_player" className=""></audio>
				<audio controls id="al2" className="d-none"></audio>
				{playlist.length > 0 ? (
					<MusicList playlist={playlist} togglePlayer={this.togglePlayer} />
				) : null}
			</>
		);
	}
}

const MusicList = ({ playlist, togglePlayer }) => {
	return (
		<>
			<div className="list-group animate__animated animate__fadeIn">
				{playlist.map(({ name, title, source, size, duration }, key) => (
					<div
						key={key}
						onClick={() => togglePlayer(`${source}`)}
						className="list-group-item list-group-item-action "
					>
						<div className="d-flex flex-column">
							<div className="d-flex justify-content-between">
								<h6>{title}</h6>
								<small></small>
							</div>
							<small>
								<b>{size} </b>
							</small>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default AudioPlayer;
