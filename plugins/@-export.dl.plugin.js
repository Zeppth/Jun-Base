import axios from 'axios'

const createRequest = (endpoint, formatData) => (url, key) =>
    axios.get(`https://nayan-video-downloader.vercel.app/${endpoint}`,
        { params: formatData ? formatData(url, key) : { url } }).then(res => res.data)
        .catch(() => ({ developer: 'MOHAMMAD NAYAN', status: false, msg: 'error' }));

const plugin = {
    export: {
        ['@dl']: {
            ndown: createRequest('ndown'),
            instagram: createRequest('instagram'),
            tikdown: createRequest('tikdown'),
            ytdown: createRequest('ytdown'),
            threads: createRequest('threads'),
            twitterdown: createRequest('twitterdown'),
            fbdown2: createRequest('fbdown2', (url, key) => ({ url, key })),
            GDLink: createRequest('GDLink'),
            pintarest: createRequest('pintarest'),
            capcut: createRequest('capcut'),
            likee: createRequest('likee'),
            alldown: createRequest('alldown'),
            spotifySearch: createRequest('spotify-search', (name, limit) => ({ name, limit })),
            soundcloudSearch: createRequest('soundcloud-search', (name, limit) => ({ name, limit })),
            spotifyDl: createRequest('spotifyDl', (url) => ({ url })),
            soundcloud: createRequest('soundcloud', (url) => ({ url })),
            terabox: createRequest('terabox', (url) => ({ url })),
        }
    },
}

export default plugin


const youtube = {
    //https://nayan-video-downloader.vercel.app/youtube?url=https%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3D7u0AkjOE64w%26list%3DRD7u0AkjOE64w%26start_radio%3D1

    "playabilityStatus": {
        "status": "LOGIN_REQUIRED",
        "reason": "Sign in to confirm that you're not a bot",
        "errorScreen": {
            "playerErrorMessageRenderer": {
                "subreason": {
                    "runs": [
                        {
                            "text": "This helps protect our community. "
                        },
                        {
                            "text": "Learn more",
                            "navigationEndpoint": {
                                "clickTrackingParams": "CAAQu2kiEwj5wdf2nZORAxWKx08IHeepBOLKAQTNG4fL",
                                "commandMetadata": {
                                    "webCommandMetadata": {
                                        "url": "https://support.google.com/youtube/answer/3037019#zippy=%2Ccheck-that-youre-signed-into-youtube",
                                        "webPageType": "WEB_PAGE_TYPE_UNKNOWN",
                                        "rootVe": 83769
                                    }
                                },
                                "urlEndpoint": {
                                    "url": "https://support.google.com/youtube/answer/3037019#zippy=%2Ccheck-that-youre-signed-into-youtube"
                                }
                            }
                        }
                    ]
                },
                "reason": {
                    "runs": [
                        {
                            "text": "Sign in to confirm that you're not a bot"
                        }
                    ]
                },
                "proceedButton": {
                    "buttonRenderer": {
                        "style": "STYLE_OVERLAY",
                        "size": "SIZE_DEFAULT",
                        "isDisabled": false,
                        "text": {
                            "simpleText": "Sign in"
                        },
                        "navigationEndpoint": {
                            "clickTrackingParams": "CAEQptEGIhMI-cHX9p2TkQMVisdPCB3nqQTiygEEzRuHyw==",
                            "commandMetadata": {
                                "webCommandMetadata": {
                                    "url": "https://accounts.google.com/ServiceLogin?service=youtube&uilel=3&passive=true&continue=https%3A%2F%2Fwww.youtube.com%2Fsignin%3Faction_handle_signin%3Dtrue%26app%3Dm%26hl%3Den-GB%26next%3D%252Fwatch%253Fv%253D7u0AkjOE64w&hl=en-GB",
                                    "webPageType": "WEB_PAGE_TYPE_UNKNOWN",
                                    "rootVe": 83769
                                }
                            },
                            "signInEndpoint": {
                                "nextEndpoint": {
                                    "clickTrackingParams": "CAEQptEGIhMI-cHX9p2TkQMVisdPCB3nqQTiygEEzRuHyw==",
                                    "commandMetadata": {
                                        "webCommandMetadata": {
                                            "url": "/watch?v=7u0AkjOE64w",
                                            "webPageType": "WEB_PAGE_TYPE_UNKNOWN",
                                            "rootVe": 83769
                                        }
                                    },
                                    "urlEndpoint": {
                                        "url": "/watch?v=7u0AkjOE64w"
                                    }
                                }
                            }
                        },
                        "trackingParams": "CAEQptEGIhMI-cHX9p2TkQMVisdPCB3nqQTi"
                    }
                },
                "thumbnail": {
                    "thumbnails": [
                        {
                            "url": "//s.ytimg.com/yts/img/meh7-vflGevej7.png",
                            "width": 140,
                            "height": 100
                        }
                    ]
                },
                "icon": {
                    "iconType": "ERROR_OUTLINE"
                }
            }
        },
        "contextParams": "Q0FFU0FnZ0I="
    },
    "streamingData": {
        "formats": [
            {
                "formatId": 18,
                "label": "mp4 (360p)",
                "type": "video_with_audio",
                "ext": "mp4",
                "quality": "360p",
                "width": 640,
                "height": 360,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=18&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5S1_GTRaWqGaHFEJI-Pd7u_uf_JIGDx9aeYApNdCnFu3HxILdvhkBaiQwKxP3KuUAoaEzLu6Q7w&spc=6b0G_HxmS_Wkr9Fi6FOB&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&cnr=14&ratebypass=yes&dur=202.106&lmt=1738734231812535&mt=1764277266&fvip=4&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Ccnr%2Cratebypass%2Cdur%2Clmt&sig=AJfQdSswRgIhAN7_UkzUWs9ozAVfl-2-BkwKAO9L4lz_qksBTCJQ6nIRAiEAuXeH2r468t1xZEQoOInFwFusloyeBlQTXz25Lp0Byds%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 1131610,
                "fps": 30,
                "audioQuality": "AUDIO_QUALITY_LOW",
                "audioSampleRate": "44100",
                "mimeType": "video/mp4; codecs=\"avc1.42001E, mp4a.40.2\"",
                "duration": 3
            },
            {
                "formatId": 315,
                "label": "webm (2160p60)",
                "type": "video_only",
                "ext": "webm",
                "quality": "2160p60",
                "width": 3840,
                "height": 2160,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=315&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=601243562&dur=202.049&lmt=1738734194275607&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgXcXJGHFm7byY95JqQTr190pCI8Fo_cU-9NuRNDOWmswCIB3wtbKz9lG6HzpbwkBTpKL3M0dPKSLPF9nYfnMrTycZ&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 25142746,
                "fps": 60,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 308,
                "label": "webm (1440p60)",
                "type": "video_only",
                "ext": "webm",
                "quality": "1440p60",
                "width": 2560,
                "height": 1440,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=308&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=353357918&dur=202.049&lmt=1738734186057550&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAPM8L_CsB75GDlwIEm8BTz6wkslYSrrXTlozq_vNSS6FAiAk8xlSZO29z2J99pVMAWje6d5sqRLCWC_KB1hLEysidg%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 14952682,
                "fps": 60,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 299,
                "label": "mp4 (1080p60)",
                "type": "video_only",
                "ext": "mp4",
                "quality": "1080p60",
                "width": 1920,
                "height": 1080,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=299&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=175111214&dur=202.050&lmt=1738734245001436&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgZmqRdQGRnRkywtMl5Gh3MiddDQa4-T5GYdT0I0wVMFMCIHcAVEOsv3wGcX36hjlBB6ZMnyXNzkUjY6HVnCjcSinp&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 8147602,
                "fps": 60,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/mp4; codecs=\"avc1.64002a\"",
                "duration": 3
            },
            {
                "formatId": 303,
                "label": "webm (1080p60)",
                "type": "video_only",
                "ext": "webm",
                "quality": "1080p60",
                "width": 1920,
                "height": 1080,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=303&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=197593746&dur=202.049&lmt=1738734178543997&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgI_pw-EpOeY0_ueRahmN-RHqvdWrjaT3_vhP2SONsrs8CIGJHFyGiFBzC7Z2l2ERx8iHpUBRLq37lb5JzmVV4PJF2&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 8458906,
                "fps": 60,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 298,
                "label": "mp4 (720p60)",
                "type": "video_only",
                "ext": "mp4",
                "quality": "720p60",
                "width": 1280,
                "height": 720,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=298&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=112170032&dur=202.050&lmt=1738734229962138&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgbvvdFHtzydsSmlz9t8NJPxWQoVOzIuFuEmpoC2NEYmICIQCifNfjZcUvGlTd91zcoQmFzsyN4OGjfnPcVL6LvlQoRw%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 5064738,
                "fps": 60,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/mp4; codecs=\"avc1.640020\"",
                "duration": 3
            },
            {
                "formatId": 302,
                "label": "webm (720p60)",
                "type": "video_only",
                "ext": "webm",
                "quality": "720p60",
                "width": 1280,
                "height": 720,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=302&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=139530936&dur=202.049&lmt=1738734203109636&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgfXY9A6INDTwFnKmqm4HjBK7lYX6a7pY2grFsvl6ODE4CICjqVpsGoIyZQD62BnAp378yW0nxvqWLtbSk3puFGSkW&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 5859710,
                "fps": 60,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 135,
                "label": "mp4 (480p)",
                "type": "video_only",
                "ext": "mp4",
                "quality": "480p",
                "width": 854,
                "height": 480,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=135&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=39654756&dur=202.066&lmt=1738734226409881&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAOm-wQH-N-9Tg53cmVDrP7ciNaJoXlUTKsXjqTVA6Y_eAiAubSLgwVwiH1MnQMeOQFhS6eYQb65SPAIEzT-2SFD-bA%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 1850449,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/mp4; codecs=\"avc1.4d401f\"",
                "duration": 3
            },
            {
                "formatId": 244,
                "label": "webm (480p)",
                "type": "video_only",
                "ext": "webm",
                "quality": "480p",
                "width": 854,
                "height": 480,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=244&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=50164275&dur=202.066&lmt=1738734178488417&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAMR7Z4lg0ouh-GJ2KvM5knPNUGVOddCzTl3Vsf12oKr_AiBxQoouQ2vPVt7kcJAmf-tZdiERIP1mHlOa1qdykFEWhQ%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 2157393,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 134,
                "label": "mp4 (360p)",
                "type": "video_only",
                "ext": "mp4",
                "quality": "360p",
                "width": 640,
                "height": 360,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=134&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=25355700&dur=202.066&lmt=1738734226344555&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgJUJtAAo4dOo1r3TAH7FLKF-MnsBfNcnqbBY1JDOYSAgCIQCEBnYLbaXnej0ICNtdo7ixVsYmLGREeN91agrkRxm2sw%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 1162343,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/mp4; codecs=\"avc1.4d401e\"",
                "duration": 3
            },
            {
                "formatId": 243,
                "label": "webm (360p)",
                "type": "video_only",
                "ext": "webm",
                "quality": "360p",
                "width": 640,
                "height": 360,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=243&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=31729970&dur=202.066&lmt=1738734183928721&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhALe4PkmpW-wvDWUaGGAvVO5KgllJyQBwE-oZoz4vFYVPAiBZBSXpwYPKcs1fYx3muWuW0u6EMo0gB60LNma6GTZPUA%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 1360941,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 133,
                "label": "mp4 (240p)",
                "type": "video_only",
                "ext": "mp4",
                "quality": "240p",
                "width": 426,
                "height": 240,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=133&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=13418660&dur=202.066&lmt=1738734226539348&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgFKiFm26Hx66qsAardwbtTCUB3KsGjD0E5Alp1vJAL28CICHM2Is6SOZk8dUXA1viRQZ9jKXTLATNqS49lD0yDLdv&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 573829,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/mp4; codecs=\"avc1.4d4015\"",
                "duration": 3
            },
            {
                "formatId": 242,
                "label": "webm (240p)",
                "type": "video_only",
                "ext": "webm",
                "quality": "240p",
                "width": 426,
                "height": 240,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=242&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=16225788&dur=202.066&lmt=1738734182939940&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgZUrnKclqqFJ5RPTm7-QdQ002ONMM1AEBZBcKDOyD2AICICHkt4AfXFniIHQCQ_EpjVoH3alNDgI3vXsirCct0MZY&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 701540,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 160,
                "label": "mp4 (144p)",
                "type": "video_only",
                "ext": "mp4",
                "quality": "144p",
                "width": 256,
                "height": 144,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=160&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fmp4&rqh=1&gir=yes&clen=5605133&dur=202.066&lmt=1738734226022277&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5309224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIhAP1K9V6Z9goay5cJ9QsfPE0iSkKMvmg7mJoy_EKPtHrlAiBqX-zPWUUTHpV-mktuC6fQy8qbNUrZpmVmx8HeVXG9UA%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 236817,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/mp4; codecs=\"avc1.4d400c\"",
                "duration": 3
            },
            {
                "formatId": 278,
                "label": "webm (144p)",
                "type": "video_only",
                "ext": "webm",
                "quality": "144p",
                "width": 256,
                "height": 144,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=278&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=video%2Fwebm&rqh=1&gir=yes&clen=6982472&dur=202.066&lmt=1738734182133393&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=530F224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgSWJLnOYDPdwTwpDjrBk1vzv9m6vniMXJmjl7UigludwCIQDUKwkPrJR_f1D65KMC9jz_V3hmFt0TNydNRlAyRO3tbA%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 296893,
                "fps": 30,
                "audioQuality": null,
                "audioSampleRate": null,
                "mimeType": "video/webm; codecs=\"vp9\"",
                "duration": 3
            },
            {
                "formatId": 139,
                "label": "m4a (50kb/s)",
                "type": "audio",
                "ext": "m4a",
                "width": null,
                "height": null,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=139&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=1233812&dur=202.199&lmt=1738734048519715&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5308224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgCOYjUV0csBBQS14GWSqMKw4czjkzIGs23_1Uv74nGxYCIENkEv0obDeLfPx1q8Ghf7yNpmpmtB-OHd7XLqVqEPEn&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 50006,
                "fps": null,
                "audioQuality": "AUDIO_QUALITY_LOW",
                "audioSampleRate": "22050",
                "mimeType": "audio/mp4; codecs=\"mp4a.40.5\"",
                "duration": 3
            },
            {
                "formatId": 140,
                "label": "m4a (131kb/s)",
                "type": "audio",
                "ext": "m4a",
                "width": null,
                "height": null,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=140&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=audio%2Fmp4&rqh=1&gir=yes&clen=3271710&dur=202.106&lmt=1738734066673099&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5308224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIgGKbRBPTjf8Q2NhCeDsQT1T580DcY9-BV7oQTofc1DwkCIEePFGO9eFG7iANCEtTqU-2rdJkl1FlmYj_46u4p87YF&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 130501,
                "fps": null,
                "audioQuality": "AUDIO_QUALITY_MEDIUM",
                "audioSampleRate": "44100",
                "mimeType": "audio/mp4; codecs=\"mp4a.40.2\"",
                "duration": 3
            },
            {
                "formatId": 249,
                "label": "opus (80kb/s)",
                "type": "audio",
                "ext": "opus",
                "width": null,
                "height": null,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=249&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=1381658&dur=202.081&lmt=1738734079466426&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5308224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRAIga1iobRGmrucl6cmmO8u-68Vx7upteIR33ZnrYj98yA0CIADZDpHRI5VDO3FR_9cYZNYi_pw-4i_djddkL-qH-7NO&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 79833,
                "fps": null,
                "audioQuality": "AUDIO_QUALITY_LOW",
                "audioSampleRate": "48000",
                "mimeType": "audio/webm; codecs=\"opus\"",
                "duration": 3
            },
            {
                "formatId": 251,
                "label": "opus (159kb/s)",
                "type": "audio",
                "ext": "opus",
                "width": null,
                "height": null,
                "url": "https://redirector.googlevideo.com/videoplayback?expire=1764299119&ei=D70oadKYD4mBi9oP7dzmqQw&ip=176.6.129.105&id=o-AGSQTxqhYeSLKsf4MOeA0XXXoYJGcJ-t3nJJrYsGb0VV&itag=251&source=youtube&requiressl=yes&xpc=EgVo2aDSNQ%3D%3D&cps=1&met=1764277519%2C&mh=Yn&mm=31%2C29&mn=sn-uxax4vopj5qx-cxgd%2Csn-4g5ednr7&ms=au%2Crdu&mv=m&mvi=3&pl=22&rms=au%2Cau&initcwndbps=2015000&bui=AdEuB5R8-BNBryeQWHcDdj5vR_GLtjaF1HKYzqh4YfRnDQpmWgAHcWzTWzSaUwbiiy1I6qIvEO9wwkw2&spc=6b0G_ARn4_Ws&vprv=1&svpuc=1&mime=audio%2Fwebm&rqh=1&gir=yes&clen=3451119&dur=202.081&lmt=1738734078995129&mt=1764277266&fvip=4&keepalive=yes&fexp=51552689%2C51565115%2C51565681%2C51580968&c=ANDROID&txp=5308224&sparams=expire%2Cei%2Cip%2Cid%2Citag%2Csource%2Crequiressl%2Cxpc%2Cbui%2Cspc%2Cvprv%2Csvpuc%2Cmime%2Crqh%2Cgir%2Cclen%2Cdur%2Clmt&sig=AJfQdSswRQIgDFyJJ7xZlE8piItb1x0p6rmj_-Ks1z2KJP6YQ_YQOgUCIQD9gmc_DRLaiNSRwZjBLKHbaQHjpbjoWGb9J2Rh_s_H9A%3D%3D&lsparams=cps%2Cmet%2Cmh%2Cmm%2Cmn%2Cms%2Cmv%2Cmvi%2Cpl%2Crms%2Cinitcwndbps&lsig=APaTxxMwRQIgFCAnBOx7G4c9yecEWnVUfyYZrgMOUFo_d_rOesOwR2gCIQCgzso9g7BTPiWlycb1Un6XnHj9fRU8bbn6ZJvcasCLXg%3D%3D",
                "bitrate": 158620,
                "fps": null,
                "audioQuality": "AUDIO_QUALITY_MEDIUM",
                "audioSampleRate": "48000",
                "mimeType": "audio/webm; codecs=\"opus\"",
                "duration": 3
            }
        ]
    }

}