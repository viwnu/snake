import React from 'react';
import { useState, useCallback } from 'react';
// import { useEffect } from 'react';
// import { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';


class Segment extends React.Component {
  render() {
    const styles = {
        transform: `translate3d(${this.props.X}px, ${this.props.Y}px, 0px)`,
        backgroundColor: this.props.color
    };
    return (
      <div className="segment" style={styles}></div>
    );
  }
}

class Snake extends React.Component {
  render() {
    return (
      this.props.segments.map((item, index) => {
        return (
          <Segment
            key = {index}
            X = {item.X}
            Y = {item.Y}
            color = {item.color}
          />
      )}));
  }
}

class Food extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      X: Math.floor(+this.props.width*Math.random()/10)*10,
      Y: Math.floor(+this.props.height*Math.random()/10)*10,
    }
  }

  render(){
    const styles = {
        transform: `translate3d(${this.props.X}px, ${this.props.Y}px, 0px)`,
        border: 'solid black'
    };
    return (
      <div className="food" style={styles}></div>
    );
  }
}

class RestartModal extends React.Component {
  render() {
    if(this.props.showModal) {
      return (
        <div className="modal">
          <p>{"Do you wanna restart?"}</p>
          <button className="modalButton" onClick={(e) => this.props.onClick(e)}>
            {"YES"}
          </button>
          <button className="modalButton" onClick={(e) => this.props.onClick(e)}>
            {"NO"}
          </button>
        </div>
      )
    }
  }
}

function Score(props) {
  return (
    <div className="score">
      <p>Score: {props.score}</p>
    </div>
  );
}

function ShowContinue(props) {
  if (props.showContinue) {
    return (
      <div className="continue_modal">
        <p>Game paused</p>
        <p>Press "Space" to continue</p>
      </div>
    )
  }
}

function Instructions() {
  return (
    <ul className="instructions">
      <li className="instructions__item">
        <div className="instructions__key_picture"><p>&#8678;</p></div>
        <div className="instructions__key_decscription"> - Turn left</div>
      </li>
      <li className="instructions__item">
        <div className="instructions__key_picture"><p>&#8680;</p></div>
        <div className="instructions__key_decscription"> - Turn right</div>
      </li>
      <li className="instructions__item">
        <div className="instructions__key_picture"><p>Space</p></div>
        <div className="instructions__key_decscription"> - Pause game</div>
      </li>
    </ul>
  )
}

function MenuButton({opened, onClick}) {
  return (
    <div className="menu_button__container"
      onClick={useCallback(() => onClick(!opened), [opened, onClick])}
    >
        <div
          className={`menu_button ${opened ? 'opened' : ''}` }
        ></div>
    </div>
  )
}

function MenuList({opened}) {
  return (
    <ul className={`menu_list ${opened ? 'menu_active' : ''}` }>
      <li><button>Continue</button></li>
      <li><button>Restart</button></li>
      <li><button>Save</button></li>
      <li><button>Load</button></li>
      <li><button>LogOut</button></li>
    </ul>
  )
}

function Menu() {
  const [opened, setOpened] = useState(false);
  return (
    <div className="menu">
      <MenuButton
        opened={opened}
        onClick={setOpened}
      />
      <MenuList
        opened={opened}
      />
    </div>
  )
}

class GameField extends React.Component {
  initialState(windowWidth, windowHeight) {
    return {
      width: windowWidth,
      height: windowHeight,
      snake: {
        segments: [
          {
            X: Math.floor(windowWidth/20)*10,
            Y: Math.floor(windowHeight/20)*10,
            color: 'black',
            speed: {
              VX: 10,//pixels per tick
              VY:0
            }
          },
          {
            X: Math.floor(windowWidth/20)*10 - 10,
            Y: Math.floor(windowHeight/20)*10,
            color: 'gray',
            speed: {
              VX: 10,//pixels per tick
              VY: 0
            }
          },
        ]
      },
      food: {
        X: Math.floor(windowWidth*Math.random()/10)*10,
        Y: Math.floor(windowHeight*Math.random()/10)*10,
      },
      showModal: false,
      timerID: 0,
      score: 0,
      gamePaused: false,
    }
  }
  constructor(props) {
    super(props);
    this.updateScore = this.updateScore.bind(this);
    this.handlePause = this.handlePause.bind(this);
    const windowWidth = Math.floor(+Math.min(window.innerWidth, window.outerWidth)/10)*10;
    const windowHeight = Math.floor(+Math.min(window.innerHeight, window.outerHeight)/10)*10;
    this.state = this.initialState(windowWidth, windowHeight);
    console.log(this.state.snake.segments[0]);
    console.log(this.state.food);
  }

  setTimer() {
    this.setState((state) => {
      let timerID = setInterval(
        () => {
          this.tick();
        },
        100
      );
      return {timerID: timerID}
    });
  }

  componentDidMount() {
    this.setTimer();
    document.addEventListener("keydown", (e) => this.handlePause(e));
  }

  componentWillUnmount() {
    clearInterval(this.state.timerID);
    document.removeEventListener("keydown", (e) => this.handlePause(e));
  }

  handleRestartClick(e) {
    if(e.target.innerText === 'YES') {
      this.setState((state) => {
        return this.initialState(this.state.width, this.state.height);
      });
      this.setTimer();
    }
    this.setState((state) => {
      return {showModal: false}
    })
  }

  updateScore() {
    this.setState((state) => {
      return {score: state.score + 1}
    })
  }

  colision() {
    const head = this.state.snake.segments.slice()[0];
    const segments = this.state.snake.segments.slice();
    for (let i = 1; i < segments.length; i++) {
      if(Math.abs(head.X + head.speed.VX - segments[i].X) + Math.abs(head.Y + head.speed.VY - segments[i].Y) === 0) {
        console.log('GAME OVER');
        clearInterval(this.state.timerID);
        this.setState(state => {
          return {
            showModal: true,
          }
        });
      }
    }
    const food = {};
    Object.assign(food, this.state.food);
    // console.log(head.X - food.X);
    // console.log(head.Y - food.Y);
    // console.log(head);
    if(Math.abs(head.X + head.speed.VX - food.X) + Math.abs(head.Y + head.speed.VY - food.Y) === 0) {
      // console.log('catched!');
      this.setState(state => {
        const segments = state.snake.segments.slice();
        const tail = {
          X: segments[segments.length - 1].X - segments[segments.length - 1].speed.VX,
          Y: segments[segments.length - 1].Y - segments[segments.length - 1].speed.VY,
          color: 'gray',
          speed: {
            VX: segments[segments.length - 1].speed.VX,
            VY: segments[segments.length - 1].speed.VY
          }
        };
        segments.push(tail);
        const food = {
          X: Math.floor(this.state.width*Math.random()/10)*10,
          Y: Math.floor(this.state.height*Math.random()/10)*10,
        };
        return {
          snake: {segments},
          food: food,
        }
      });
      this.updateScore();
    }
  }

  handlePause(e) {
    if(e.key === ' ') {
      if(!this.state.gamePaused) {
        clearInterval(this.state.timerID);
        this.setState(state => {
          return {
            gamePaused: true,
          }
        });
      } else {
        this.setState((state) => {
          return {
            gamePaused: false,
          }
        });
        this.setTimer();
      }
    }
  }

  tick() {
    this.colision();
    this.setState((state) => {
      function coordIncr(coord, speed, bound) {
        if(speed > 0) {
          if(coord < bound - 20) {
            return (coord + speed);
          }
          return 10;
        }
        if(coord >= 10) {
          return (coord + speed);
        }
        return (bound - 10);
      };
      let segments = state.snake.segments.map((item, index, array) => {
        const segment = {};
        if(index === 0) {
          segment.color = 'black';
          segment.X = coordIncr(item.X, item.speed.VX, state.width);
          segment.Y = coordIncr(item.Y, item.speed.VY, state.height);
          segment.speed ={};
          Object.assign(segment.speed, item.speed);
        } else {
          segment.color = 'gray';
          segment.X = array[index - 1].X;
          segment.Y = array[index - 1].Y;
          segment.speed ={};
          Object.assign(segment.speed, array[index - 1].speed);
        };
        return segment;
      });
      let keyIsPressed = false;
      function handleKeyDown(e) {
        if(!keyIsPressed) {
          // console.log(e.key);
          let VX1 = segments[0].speed.VX;
          let VY1 = segments[0].speed.VY;
          if(e.key === 'ArrowLeft') {
            VX1 = segments[0].speed.VY;
            VY1 = -segments[0].speed.VX;
          }
          if(e.key === 'ArrowRight') {
            VX1 = -segments[0].speed.VY;
            VY1 = segments[0].speed.VX;
          }
          segments[0].speed.VX = VX1;
          segments[0].speed.VY = VY1;
          keyIsPressed = true;
        };
      };

      document.addEventListener("keydown", (e) => handleKeyDown(e));
      return {snake: {segments}};
    });
    document.removeEventListener("keydown", (e) => this.handleKeyDown(e));
    // console.log(this.state);
  }

  render() {
    return (
      <div>
        <div className = "snake__container">
          <Snake
            width = {this.state.width}
            height = {this.state.height}
            segments = {this.state.snake.segments}
            // handleKeyDown = {(e) => this.handleKeyDown(e)}
            // tick = {() => this.tick()}
          />
          <Food
            X = {this.state.food.X}
            Y = {this.state.food.Y}
          />
          <RestartModal
            showModal = {this.state.showModal}
            onClick = {(e) => this.handleRestartClick(e)}
          />
          <ShowContinue
            showContinue = {this.state.gamePaused}
          />
        </div>
        <div className="interface_container">
          <Score
            score = {this.state.score}
          />
          <Instructions/>
          <Menu />
        </div>
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<GameField />);
