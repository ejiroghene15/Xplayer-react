import React, { Component } from "react";

const api = "https://inexus.dev/react_app/xplayer";

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

	songDuration = (duration) => {
		duration = parseInt(duration);
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
				size = size / 1048576;
				size = parseFloat(size).toPrecision(3) + " MB";
				let reader = new FileReader();
				let reader2 = reader;
				reader.onload = async ({ target: { result } }) => {
					reader2.onload = ({ target }) => {
						let audioContext = new (window.AudioContext ||
							window.webkitAudioContext)();
						audioContext.decodeAudioData(target.result, async (buffer) => {
							let duration = this.songDuration(buffer.duration);
							await this.saveSong(name, name, size, result, duration);
						});
					};
					reader2.readAsArrayBuffer(_audio.files[indx]);
				};
				reader.readAsDataURL(_audio.files[indx]);
			}
		});
	};

	saveSong = async (name, title, size, source, duration) => {
		/*
		 * save the song to the db with the following params
		 * name => primary key used to identify the song
		 * title => Initially set to the name of the song, but can be edited.
		 * size => the size of the song in mega bytes
		 * source => the source of the song
		 * duration => the duration of the song.
		 */
		await fetch(`${api}/song_controller.php`, {
			method: "post",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: "song_controller",
				name,
				title,
				size,
				source,
				duration,
			}),
		})
			.then((res) => res.json())
			.then((res) => this.updatePlaylist(res))
			.catch((err) => console.log(err));
	};

	fetchSongs = async () => {
		/*
		 * get all the songs stored in the database when the page loads
		 */
		await fetch(`${api}/song_controller.php`, {
			method: "post",
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				action: "getsongs",
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				// console.log(res);
				this.updatePlaylist(res);
			})
			.catch((err) => console.log(err));
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
	return (
		<React.Fragment>
			<div className="list-group animate__animated animate__fadeIn">
				{playlist.map(({ name, title, source, size, duration }, key) => (
					<div
						key={key}
						onClick={() => togglePlayer(`${api}/${source}`)}
						className="list-group-item list-group-item-action "
					>
						<div className="d-flex flex-column">
							<div className="d-flex justify-content-between">
								<h6>{title}</h6>
								<small>{duration}</small>
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
