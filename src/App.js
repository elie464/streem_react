import React, { Component } from 'react';
import logo from './logo.svg';

import { FormGroup, ControlLabel, FormControl, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { NotificationContainer, NotificationManager } from 'react-notifications';
import update from 'immutability-helper'
import BarChartComponent from './components/bar_chart';

import { HISTOGRAM_URL } from './constants/app_constants';

import './styles/ui.css'
import 'react-notifications/lib/notifications.css';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      querying: false,
      urls: [],
      data: [],
      times: [],
      interval: "",
      before: "",
      after: ""
    }
  }

  handleChange(e){
    var name, obj;
    name = e.target.name;
    return this.setState((
      obj = {},
        obj["" + name] = e.target.value,
        obj
    ));
  }

  handleSubmit(e) {
    e.preventDefault();
    this.setState({querying: true});
    let pageUrls = this.handlePageUrlParams();
    fetch(HISTOGRAM_URL + "?" +
      "before=" + this.state.before +
      "&after=" + this.state.after +
      "&interval=" + this.state.interval +
      pageUrls)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then((responseJson) => {
        this.setState({
          data: this.handleData(responseJson)
        });
        console.log("changed data");
      })
      .catch((error) => {
        NotificationManager.error('Error', error.message);
      });
    this.setState({querying: false});
  }

  handlePageUrlParams(){
    var out = "";
    for(var i=0; i < this.state.urls.length; i++) {
      out = out.concat("&page_url[]=" + this.state.urls[i])
    }

    return out;
  }

  handleData(result) {
    let data = [];
    result['aggregations']['time']['buckets'].map((bucket) => {
      let time = this.getTime(bucket['key_as_string']);
      var entry = {};
      bucket['url']['buckets'].map((url) => {
        var views = url['doc_count'];
        var url_key = url['key'];
        entry['name'] = time;
        entry[url_key] = views;
        data.push(entry);
      })
    });
    return data;
  }

  getTime(key){
    const OFFSET = 1;
    const TIME_LENGTH = 5;
    return key.substr(key.indexOf('T') + OFFSET, TIME_LENGTH)
  }

  handleAddUrl(e){
    if (e.key === 'Enter') {
      let new_url = e.target.value;
      this.setState({
        urls: this.state.urls.concat(new_url)
      });
      e.target.value = "";
    }
  }

  handleRemoveUrl(url) {
    var index = this.state.urls.indexOf(url);
    var new_urls = update(this.state.urls, {$splice: [[index, 1]]});
    this.setState({urls: new_urls});
  }

  renderUrls(){
    return (
      <div>
        <ListGroup>
        {this.state.urls.map((url, index) => (
            <ListGroupItem key={index}>
              <a href="#" onClick={() => this.handleRemoveUrl(url)}>{url}</a>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Streem Histogram</h1>
        </header>
        <div className="container padding-top-30">
          <div className="row">
            <div className="col-md-3">
              <form>
                <FormGroup>
                  <ControlLabel>Before</ControlLabel>
                  <FormControl type="text" name="before" onChange={this.handleChange.bind(this)} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>After</ControlLabel>
                  <FormControl type="text" name="after" onChange={this.handleChange.bind(this)} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Interval</ControlLabel>
                  <FormControl type="text" name="interval" onChange={this.handleChange.bind(this)} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Urls</ControlLabel>
                  <p>Enter to add, Click to remove</p>
                  <FormControl type="text" onKeyPress={this.handleAddUrl.bind(this)} />
                </FormGroup>
                {this.renderUrls()}
                <Button className="btn-primary" onClick={this.handleSubmit.bind(this)} disabled={this.state.querying}>Submit</Button>
              </form>
            </div>
            <div className="col-md-9">
              <BarChartComponent key="barchart" urls={this.state.urls} data={this.state.data} />
            </div>
          </div>
        </div>
        <NotificationContainer/>
      </div>
    );
  }
}

export default App;
