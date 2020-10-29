import React, { Component, useState, useContext, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faFastBackward,
	faFastForward,
	faPause,
	faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { songDuration } from "./feature";
import toastr from "toastr";
import "boxicons/css/boxicons.min.css";

toastr.options.timeOut = 5000;

const AudioCxt = React.createContext();
// axios.defaults.baseURL = "https://inexus.dev/react_app/xplayer/";
axios.defaults.baseURL = "http://localhost/tuts/";
const API = axios.defaults.baseURL;

class AudioPlayer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			playlist: [],
			message: "Playlist is empty, upload a song",
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

	deleteSong = (song) => {
		let { currentSrc } = this.music_player();
		if (currentSrc !== `${API}${song}`) {
			let fd = new FormData();
			fd.append("action", "delete");
			fd.append("song_name", song);

			axios.post(`song_controller.php`, fd).then(({ data }) => {
				if (data.status == true) {
					this.updatePlaylist(data.songs);
				} else {
					this.setState({
						playlist: [],
					});
				}
			});
		} else {
			toastr.warning("You cannot delete the current track playing");
		}
	};

	fetchSongs = async () => {
		axios
			.get(`song_controller.php`)
			.then(({ data }) => {
				if (data.status == true) {
					this.updatePlaylist(data.songs);
				}
			})
			.catch((err) =>
				this.setState({ message: "Sorry, unable to get songs at the moment" })
			);
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
		const { playlist, message } = this.state;
		return (
			<React.Fragment>
				<section className="container-fluid">
					<button
						className="btn btn-sm btn-dark my-3"
						onClick={this.triggerUpload}
					>
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
						<AudioCxt.Provider
							value={{
								player: this.music_player,
								togglePlayer: this.togglePlayer,
							}}
						>
							<MusicList playlist={playlist} deleteSong={this.deleteSong} />
							<TrackBar />
						</AudioCxt.Provider>
					) : (
						<div>{message}</div>
					)}
				</section>
			</React.Fragment>
		);
	}
}

const MusicList = (props) => {
	let { playlist, deleteSong } = props;
	let { togglePlayer } = useContext(AudioCxt);

	return (
		<React.Fragment>
			<div className="list-group animate__animated animate__fadeIn">
				{playlist.map(({ title, source, size, duration }, key) => (
					<div className="d-flex mb-3" key={key}>
						<div
							onClick={() => togglePlayer(`${API}${source}`)}
							className="list-group-item list-group-item-action border-right-0 sl"
							data-song-title={title}
							data-source={`${API}${source}`}
						>
							<div className="d-flex flex-column">
								<h6 className="m-0" style={{ wordBreak: "break-word" }}>
									{title}
								</h6>
								<small className="align-self-end">
									{songDuration(duration)}
								</small>
								<small>
									<b>{size} </b>
								</small>
							</div>
						</div>
						<section className="d-flex justify-content-between flex-column">
							<a
								download={title}
								href={`${API}${source}`}
								className="btn btn-sm btn-dark border-left-0"
							>
								<i class="bx bxs-download"></i>
							</a>
							<button
								className="btn btn-sm btn-danger border-left-0"
								onClick={() => deleteSong(source)}
							>
								<i class="bx bx-trash"></i>
							</button>
						</section>
					</div>
				))}
			</div>
		</React.Fragment>
	);
};

const TrackBar = () => {
	const { player } = useContext(AudioCxt);
	let { paused, src } = player();
	let [playing, setPlaying] = useState(false);
	let [loop, setLoop] = useState(false);
	let [playingTitle, setPlayingTitle] = useState("");
	let cl = ["bg-secondary", "text-light"];

	let tracker = () => document.querySelector("#tracker");
	let time_monitor = () => document.querySelector("#tm");
	let song_list = () => document.querySelectorAll(".sl");
	player().onplay = () => (setPlaying(true), player().play(), trackTime());
	player().onpause = () => (setPlaying(false), player().pause());
	player().onended = () => {
		if (!player().loop) {
			changeSong("next");
		}
	};

	let setActiveSong = () =>
		song_list().forEach((elem, indx) => {
			elem.classList.remove(...cl);
		});

	useEffect(() => {
		tracker().addEventListener("input", (e) => {
			let currtime = e.currentTarget.value;
			player().currentTime = currtime;
		});

		song_list().forEach((elem, indx) => {
			elem.addEventListener("click", () => {
				setActiveSong();
				setPlayingTitle(elem.dataset.songTitle);
				elem.classList.add(...cl);
			});
		});
	});

	let repeatSong = () => {
		setLoop(!loop);
		player().loop = !loop;
	};

	let togglePlayer = () => {
		return src.trim() !== ""
			? paused
				? player().play()
				: player().pause()
			: null;
	};

	let trackTime = () => {
		let timer = setInterval(function () {
			if (!(isNaN(player().currentTime) || isNaN(player().duration))) {
				tracker().value = player().currentTime;
				tracker().max = player().duration;

				time_monitor().innerHTML = `<span>${songDuration(
					player().currentTime
				)}</span> / <span>${songDuration(player().duration)}</span>`;

				if (player().ended == true) {
					time_monitor().innerHTML = `<span>0:00</span> / <span>${songDuration(
						player().duration
					)}</span>`;

					clearInterval(timer);
					tracker().value = 0;
				}
			}
		}, 1000);
	};

	let changeSong = (dir) => {
		let { nextSibling, previousSibling } = document.querySelector(
			`.sl[data-song-title='${playingTitle}']`
		).parentNode;
		if (
			(dir == "next" && nextSibling !== null) ||
			(dir == "prev" && previousSibling !== null)
		) {
			let elem =
				dir == "next"
					? nextSibling.childNodes[0]
					: previousSibling.childNodes[0];
			player().src = elem.dataset.source;
			setActiveSong();
			elem.classList.add(...cl);
			setPlayingTitle(elem.dataset.songTitle);
			player().play();
			toastr.info(elem.dataset.songTitle, "Now Playing");
		}
	};

	return (
		<React.Fragment>
			<div className="p-2 bg-dark text-light">
				<section>
					{playingTitle !== "" ? (
						<div className="text-center">
							<small>
								<b className="d-block">Now Playing</b>
								<p>{playingTitle}</p>
							</small>
						</div>
					) : null}
				</section>
				<section className="d-flex">
					<div className="btn-group" role="group">
						<button
							type="button"
							className="btn btn-dark"
							onClick={() => changeSong("prev")}
						>
							<FontAwesomeIcon icon={faFastBackward} />
						</button>
						<button
							type="button"
							className="btn btn-dark"
							onClick={() => togglePlayer()}
						>
							<FontAwesomeIcon icon={playing ? faPause : faPlay} />
						</button>
						<button
							type="button"
							className="btn btn-dark"
							onClick={() => changeSong("next")}
						>
							<FontAwesomeIcon icon={faFastForward} />
						</button>
					</div>
					<span className="ml-auto mt-1">
						<small
							className={`px-2 py-0 ${loop ? "btn btn-light" : "btn btn-dark"}`}
							onClick={() => repeatSong()}
						>
							<i class="bx bx-repeat"></i>
						</small>
					</span>
				</section>
				<div className="d-flex mt-1">
					<input
						id="tracker"
						type="range"
						min="0"
						className="align-middle"
						style={{ flexGrow: 100 }}
						// disabled={!playing}
					/>

					<small id="tm" className="align-middle ml-2 font-weight-bold">
						0:00 / 0:00
					</small>
				</div>
			</div>
		</React.Fragment>
	);
};

export default AudioPlayer;
