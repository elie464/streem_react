import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import './styles/ui.css'
import { FormGroup, ControlLabel, FormControl, Button, ListGroup, ListGroupItem } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import update from 'immutability-helper'

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      querying: false,
      urls: [],
      data: [],
      times: [],
      interval: null,
      before: null,
      after: null
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

  handleSubmit(e){
    e.preventDefault();
    this.setState({querying: true});
    const histogram_url = "http://localhost:3001/histogram";
    let page_urls = this.build_page_urls();
    fetch(histogram_url + "?" +
      "before=" + this.state.before +
      "&after=" + this.state.after +
      "&interval=" + this.state.interval +
      page_urls)
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('Something went wrong');
        }
      })
      .then((responseJson) => {
        this.setState({
          data: this.build_data(responseJson)
        });
      })
      .catch((error) => {
        console.log(error)
      });
  }

  build_page_urls(){
    var out = "";
    for(var i=0; i < this.state.urls.length; i++) {
      out = out.concat("&page_url[]=" + this.state.urls[i])
    }

    return out;
  }

  build_data(result) {
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

  renderBarChart(){
    return(
      <BarChart width={600} height={300} data={this.state.data}
                margin={{top: 20, right: 30, left: 20, bottom: 5}}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis/>
        <Tooltip/>
        <Legend />
        {this.state.urls.map((url, index) => (
          <Bar key={index} dataKey={url} stackId="a" fill={this.getRandomColor()} />
        ))}
      </BarChart>
    )
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

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
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
                  <FormControl type="text" onKeyPress={this.handleAddUrl.bind(this)} />
                </FormGroup>
                {this.renderUrls()}
                <Button className="btn-primary" onClick={this.handleSubmit.bind(this)}>Submit</Button>
              </form>
            </div>
            <div className="col-md-9">
              {this.renderBarChart()}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
