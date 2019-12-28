// stopcode = window.setTimeout(() => {if (document.getElementById("songs").contentDocument !== undefined && document.getElementById("songs").contentDocument.documentElement !== undefined) { main();
// window.clearTimeout(stopcode)}}, 20);

let sanger, tittel_div, gen, play_button, shuffle_button;
const states = {UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5};

main();

function main() {
    tittel_div = document.getElementById("title");
    play_button = document.getElementById("play");
    play_button.addEventListener("click", play);
    shuffle_button = document.getElementById("shuffle");
    shuffle_button.addEventListener("click", shuffle);
// 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement("script");

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function play() {
    gen = songs();
    sanger = hentSanger();
    onPlayerStateChange({data: states.ENDED});
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

function onYouTubeIframeAPIReady() {
    player = new YT.Player("player", {
        height: "390",
        width: "640",
        videoId: "dQw4w9WgXcQ",
        events: {
            "onReady": onPlayerReady,
            "onStateChange": onPlayerStateChange
        }
    });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
    // onPlayerStateChange({data: states.ENDED})
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event) {
    if (event.data === states.ENDED) {
        let neste = gen.next();
        if (!neste.done) {
            enqueue(neste.value);
        }
    }
    else if (event.data === states.UNSTARTED) {
        player.playVideo();
    }
}

function enqueue(search) {
    player.cuePlaylist({listType: "search", list: search, index: 0});
    tittel_div.innerText = search;
}

function* songs() {
    for (let i = 0; i < sanger.length; i++) {
        yield sanger[i];
    }
    return true;
}

// Fisher-Yates shuffle
function shuffle() {
    sanger = hentSanger(false);
    for (let i = sanger.length-1; i > 0; i--) {
        const j = Math.round(Math.random()*i);
        const temp = sanger[i];
        sanger[i] = sanger[j];
        sanger[j] = temp;
    }
    document.getElementById("songs").value = sanger.join("\n");
}

function hentSanger(clean = true) {
    let ret =  document.getElementById("songs").value;
    if (clean) {
        ret = ret.replace(/[^\s\w\n]/g, "");
    }
    return ret.split("\n").filter(x => x);
}