import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localisation: {},
      formdescription: {}
    }
  }

  componentDidMount() {
    // get JSON FormDescription 
    let serverurl = "http://localhost:8888/server.php?data=formdescription";

    fetch(serverurl)
      .then(res => res.json())
      .then((data) => {
        // console.log('data:', data);
        this.setState({ formdescription: data })
      });
    serverurl = "http://localhost:8888/localisation.php?lang=en";
    fetch(serverurl)
      .then(res => res.json())
      .then((data) => {
        // console.log('data:', data);
        this.setState({ localisation: data })
      });
  }

  render() {

    if (this.state.formdescription.hasOwnProperty('id') && this.state.localisation.hasOwnProperty('uploadButton')) {
      return (
        <div>
          <Title title="HuC Editor React" />
          <Form description={this.state.formdescription} />
          <ButtonFrame localisation={this.state.localisation} />
        </div>
      )
    ;
    } else {
      return <div>S..N...OR.RR..RRR...R...R.R.RR.R.R.R.R.................................................................</div>;
    }
  }
}

function Form(props) {
  // console.log('binnen form', props.description.content);
  // let profileid = props.description.id;
  let ID = props.description.content[0].ID;
  return (
    <div id="ccform">
      <div id={ID} className="component" data-name={props.description.content[0].attributes.name} data-order="undefined"></div>
      <div className="componentHeader">{props.description.content[0].attributes.label}</div>
      <Content content={props.description.content[0].content} />
    </div>
  )
}

function Content(props) {
  console.log('props', props);
  const content = props.content.map((thing, index) => {
      if(thing.type === 'Element') {
         return <div key={index} className={thing.type} data-name={thing.attributes.name} data-order="undefined" >{thing.type} {thing.attributes.label}</div>
      } else if(thing.type === 'Component') {
          let componentje = <div id={thing.id} className="component" data-name={thing.attributes.name}></div>; // TODO recursiviteit checken 
         return <Content key={index} content={thing.content} />
      }
  });
  return <div>{content}</div>
}


function ButtonFrame(props) { // TODO Eventlisteners
  // console.log('props  localisation', props.localisation);
  return (
  <div id="btnFrame">
    <input type="button" value={props.localisation.submitButton.label} id="OKbtn" />
    <input type="button" value={props.localisation.saveButton.label} id="saveBtn" />
    <input type="button" value={props.localisation.resetButton.label} id="resetBtn" />
    <ErrorSpace />
  </div>
  )
}

function ErrorSpace(props) {
  return <div id="errorSpace"></div>
}
function Title(props) {
  return <h1>{props.title}</h1>
}


export default App;




