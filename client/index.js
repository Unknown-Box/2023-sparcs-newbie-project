var { useState, useEffect } = React;

function App(props) {
  var [ view, setView ] = useState("signin");
  var [ musicList, setMusicList ] = useState([]);

  switch(view) {
    case "signin":
      return <SignIn setView={setView} />
    case "signup":
      return <SignUp setView={setView} />
    case "playlist":
      return <Playlist setView={setView} musicList={musicList} setMusicList={setMusicList} />
    case "addmusic":
      return <AddMusic setView={setView} musicList={musicList} setMusicList={setMusicList} />
    default:
      return (
        <span>else</span>
      );
  }
}

function getSalt() {
  return "hello salt!";
}

function SignIn(props) {
  var { setView } = props;

  // async function sha256(s) {
  //   return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s))))
  //               .map(b => b.toString(16).padStart(2, "0"))
  //               .join("");
  // }

  function signin(event) {
    var form = event.target;
    // sha256(getSalt() + form.password.value).then(password => {
    //   fetch("/session", {
    //     method: "POST", 
    //     headers: {
    //       "Content-Type": "application/json"
    //     }, 
    //     body: JSON.stringify({
    //       email: form.email.value, 
    //       password
    //     })
    //   }).then(() => setView("playlist"), () => alert("sign in failed"))
    // });
    var password = md5(getSalt() + form.password.value);

    fetch("/session", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        email: form.email.value, 
        password
      })
    }).then(response => {
      if (response.ok)
        setView("playlist");
      else
        alert("sign in failed");
    });

    event.preventDefault();
    return false;
  }

  return (
    <div id="signin">
      <h1>Sign in</h1>
      <form onSubmit={signin}>
        <div>
          <label>
            <h2>email</h2>
            <input type="text" name="email" placeholder="playlist@music.com" />
          </label>
        </div>
        <div>
          <label>
            <h2>password</h2>
            <input type="password" name="password" placeholder="pa$5w0rD" />
          </label>
        </div>
        <div>
          <div>
            <button onClick={() => {setView("signup");}}>sign up</button>
          </div>
          <div>
            <button type="submit">sign in</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function SignUp(props) {
  var { setView } = props;

  function signup(event) {
    var form = event.target;
    var password = md5(getSalt() + form.password.value);

    fetch("/users", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        email: form.email.value, 
        nickname: form.nickname.value, 
        password
      })
    }).then(response => {
      if (response.ok)
        setView("signin");
      else
        alert("sign up failed");
    });

    event.preventDefault();
    return false;
  }

  return (
    <div id="signup">
      <h1>Sign up</h1>
      <form onSubmit={signup}>
        <div>
          <label>
            <h2>email</h2>
            <input type="text" name="email" placeholder="playlist@music.com" />
          </label>
        </div>
        <div>
          <label>
            <h2>nickname</h2>
            <input type="text" name="nickname" placeholder="musicismylife" />
          </label>
        </div>
        <div>
          <label>
            <h2>password</h2>
            <input type="password" name="password" placeholder="pa$5w0rD" />
          </label>
        </div>
        <div>
          <div>
            <button onClick={() => {setView("signin");}}>sign in</button>
          </div>
          <div>
            <button type="submit">sign up</button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Playlist(props) {
  var { setView, musicList, setMusicList } = props;
  var [ lastRefreshedTimestamp, refresh ] = useState(Date.now());

  useEffect(() => {
    fetch("/playlist", {
      method: "GET", 
      headers: {
        "Content-Type": "application/json"
      }
    }).then(response => response.json())
      .then(playlist => {setMusicList(playlist.musics);})
      .catch(e => {setView("signin");})
  }, [lastRefreshedTimestamp])

  function Music(props) {
    var { uuid, idx, title, artist } = props;

    function deleteMusic() {
      fetch(`playlist/music/${uuid}`, {
        method: "DELETE", 
        headers: {
          "Content-Type": "application/json"
        }
      }).then(response => response.json())
        .then(response => {
          alert("successfully deleted");
          refresh(Date.now());
        })
        .catch(e => {alert("deletion failed");})
    }

    return (
      <div className="row">
        <div className="col">{idx}</div>
        <div className="col">{title}</div>
        <div className="col">{artist}</div>
        <div className="col">
          <a href={`https://www.youtube.com/results?search_query=${title} ${artist}`} target="_blank" rel="noreferrer" className="material-symbols-outlined">open_in_new</a>
        </div>
        <div className="col">
          <a className="material-symbols-outlined" onClick={deleteMusic}>delete</a>
        </div>
      </div>
    );
  }

  function playlist2Image() {
    alert("Not supported yet...");
    return;
    html2canvas(document.body).then(canvas => {
      var link = document.createElement("a");

      link.download = "playlist.png";
      link.href = canvas.toDataURL();
      link.click();
    })
  }

  return (
    <div id="playlist-container">
      <h1>Playlist</h1>
      <div id="toolbar">
        <div>
          <button className="material-symbols-outlined" onClick={() => {setView("addmusic");}}>add</button>
        </div>
        <div>
          <button className="material-symbols-outlined" onClick={playlist2Image}>image</button>
        </div>
      </div>
      <div id="playlist">
        {musicList.map(({ uuid, title, artist }, idx) => <Music key={uuid} uuid={uuid} idx={idx+1} title={title} artist={artist} />)}
      </div>
    </div>
  );
}

function AddMusic(props) {
  var { setView, musicList, setMusicList } = props;

  function addMusic(event) {
    var form = event.target;

    fetch("/playlist/music", {
      method: "POST", 
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({
        title: form.title.value, 
        artist: form.artist.value
      })
    }).then(response => response.json())
      .then(response => {
        setMusicList([
          ...musicList, 
          {
            uuid: response.uuid, 
            title: response.title, 
            artist: response.title, 
            youtubeUrl: "asf"
          }
        ]);
        setView("playlist");
      });

    event.preventDefault();
    return false;
  }

  return (
    <div id="add-music">
      <h1>Add music</h1>
      <form onSubmit={addMusic}>
        <div>
          <label>
            <h2>title</h2>
            <input type="text" name="title" placeholder="Kaze" />
          </label>
        </div>
        <div>
          <label>
            <h2>artist</h2>
            <input type="text" name="artist" placeholder="YOUNHA" />
          </label>
        </div>
        <div>
          <div>
            <button>
              <a onClick={() => {setView("playlist");}}>cancel</a>
            </button>
          </div>
          <div>
            <button type="submit">add</button>
          </div>
        </div>
      </form>
    </div>
  );
}


const root = ReactDOM.createRoot(document.getElementById("main"));
root.render(<App />);
