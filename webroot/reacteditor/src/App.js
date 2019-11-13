import React from 'react';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      localisation: '',
      formdescription: ''
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
    serverurl = "http://localhost:8888/localisation.php?lang=nl";
    fetch(serverurl)
      .then(res => res.json())
      .then((data) => {
        // console.log('data:', data);
        this.setState({ localisation: data })
      });
  }

  render() {
    // let buttontexts = ['Submit', 'Save', 'Back'];
    // console.log('na mount (localisation): ', this.state.localisation);

    return (
      <div id="ccform" className="App">
        <Title title="HuC Editor React" />
        <Form description="{this.state.formdescription}" />
        <ButtonFrame localisation={this.state.localisation} />
      </div>
    );
  }
}

function Form(props) {
  return <div><form></form></div>
}

function ButtonFrame(props) {
  // const texts = props.buttontexts;
  // const buttons = texts.map((text) => <button>{text}</button>);
  //  return <div id="btnFrame">{buttons}</div>
  
  console.log('props', props);
  // console.log('props localisation', props.localisation.submitButton);
  let submitbutton = props.localisation.submitButton;
  // console.log('submitbutton', submitbutton);
  // let label = props.localisation.submitButton["label"];
  // First attempt
  // console.log(submitbutton.hasOwnProperty("label"));
    // let label = submitbutton["label"];
    // console.log('label', label);s
  
    // if (submitbutton["label"]){

    // }

  // let k = submitbutton.hasOwnProperty();
  let r = [];

  for(let p in submitbutton) {
    if (submitbutton.hasOwnProperty(p)) {
      // Do things here
      console.log('property:', p, 'value:', submitbutton[p]);
      if(p === 'label') {
        r['label'] = submitbutton[p];
      }
    }
  }

  // 2nd Alternative
  // for (var property of Object.keys(submitbutton)) {
  //     console.log('property', property);
  //     console.log('value?', submitbutton.property);
  // }

  return (<div id="btnFrame">
    <input type="button" value={r.label} id="OKbtn" />
    <input type="button" value="Save" id="saveBtn" />
    <input type="button" value="Back" id="resetBtn" />
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




