let searchTerms: Array<string>;
let index: number;
let chosenIds: Record<string, string>; // TODO: Type
// TODO: GC ununsed chosen IDs

const title_el: HTMLHeadingElement = <HTMLHeadingElement>document.getElementById("title"),
    searchTerms_el: HTMLTextAreaElement = <HTMLTextAreaElement>document.getElementById("searchTerms");

const play_all_button: HTMLInputElement = <HTMLInputElement>document.getElementById("play_all_button"),
    shuffle_button: HTMLInputElement = <HTMLInputElement>document.getElementById("shuffle"),
    next_button: HTMLInputElement = <HTMLInputElement>document.getElementById("next_button"),
    prev_button: HTMLInputElement = <HTMLInputElement>document.getElementById("prev_button");

const enum ApiUrls {
    SEARCH = "https://www.googleapis.com/youtube/v3/search",
    IFRAME = "https://www.youtube.com/iframe_api"
}

const api_key: string = "AIzaSyA1P95Lfz8IZRq8jzvy1E_m-wEKaRJJ8xw";

main();

function main(): void {
    play_all_button.addEventListener("click", play_all);
    shuffle_button.addEventListener("click", shuffle);
    next_button.addEventListener("click", next);
    prev_button.addEventListener("click", prev);

// 2. This code loads the IFrame Player API code asynchronously.
    const tag: HTMLScriptElement = <HTMLScriptElement>document.createElement("script");

    tag.src = ApiUrls.IFRAME;
    const firstScriptTag: HTMLScriptElement = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    chosenIds = {};
}

function play_all(): void {
    index = -1;
    prev_button.disabled = true;
    next_button.disabled = false;
    searchTerms = getSongs();
    next();
}

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
let player: YT.Player;

function onYouTubeIframeAPIReady(): void {
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
function onPlayerReady(event: YT.OnStateChangeEvent): void {
    play_all_button.disabled = false;
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
function onPlayerStateChange(event: YT.OnStateChangeEvent): void {
    if (event.data === YT.PlayerState.ENDED) {
        cacheSelectedResult();
        next();
    } else if (event.data === YT.PlayerState.UNSTARTED) {
        player.playVideo();
    }
}

function next(): void {
    index++;
    if (index < searchTerms.length) {
        // playSearch(searchTerms[index]);
        playSearchWithAlternatives(searchTerms[index]);
        if (chosenIds.hasOwnProperty(index)) {

        }
        if (index === searchTerms.length - 1) {
            next_button.disabled = true;
        } else if (index === 1) {
            prev_button.disabled = false;
        }
    }
}

function prev(): void {
    index--;
    if (0 <= index) {
        // playSearch(searchTerms[index]);
        playSearchWithAlternatives(searchTerms[index]);
        if (index === 0) {
            prev_button.disabled = true;
        } else if (index === searchTerms.length - 2) {
            next_button.disabled = false;
        }
    }
}

function playSearch(search: string): void {
    // player.cuePlaylist({listType: "SEARCH", list: SEARCH, index: 0});
    // playlistTest();
    title_el.innerText = search;
    let ids = getVideoIds(search);
    if (ids && ids.length > 0) {
        player.cueVideoById(ids[0]);
    }
}

function playSearchWithAlternatives(search: string): void {
    title_el.innerText = search;
    const cachedId = chosenIds[search];
    let ids = getVideoIds(search, 5);
    if (ids) {
        const indexOfCachedInResults = search.indexOf(cachedId);
        if (indexOfCachedInResults !== -1) {
            ids.splice(indexOfCachedInResults, 1);
        }
        ids.unshift(cachedId);
        player.cuePlaylist(ids);

    }
}

// Fisher-Yates shuffle
function shuffle(): void {
    searchTerms = getSongs(false);
    for (let i = searchTerms.length - 1; i > 0; i--) {
        const j = Math.round(Math.random() * i);
        const temp = searchTerms[i];
        searchTerms[i] = searchTerms[j];
        searchTerms[j] = temp;
    }
    searchTerms_el.value = searchTerms.join("\n");
}

function getSongs(clean: boolean = true): string[] {
    let ret = searchTerms_el.value;
    if (clean) {
        ret = ret.replace(/[^\s\w\n]/g, "");
    }
    return ret.split("\n").filter(x => x.trim() !== "");
}

function objToArgs(obj: { [key: string]: string }) {
    let args = "";
    for (const property in obj) {
        if (!obj.hasOwnProperty(property)) continue;
        args += property + "=" + obj[property] + "&";
    }
    return args.slice(0, args.length - 1);
}

// TODO: Async
function getVideoIds(search: string, maxResults: number = 1): string[] {
    try {
        const request: XMLHttpRequest = new XMLHttpRequest();
        const args = {
            part: "id" /*+ ",snippet" */,
            key: api_key,
            q: search,
            maxResults: maxResults.toString(),
            type: "video"
        };

        request.open("GET", encodeURI(ApiUrls.SEARCH + "?" + objToArgs(args)), false);
        // request.onreadystatechange = e => console.log(request.response);
        request.send();
        let responseObject: {items: {id: {videoId: string}}[]} = JSON.parse(request.response);
        if (responseObject.items.length === 0) {
            console.warn("No result matching SEARCH term '" + search + "'.");
            return null;
        } else {
            return responseObject.items.map(x => x.id.videoId);
        }
    } catch (e) {
        console.warn("Request for SEARCH term '" + search + "' unsuccesful. Contact developer, and include this message:");
        console.warn(e.stack);
    }
}

function cacheSelectedResult(): void {
    chosenIds[searchTerms[index]] = player.getPlaylistIndex().toString();
}