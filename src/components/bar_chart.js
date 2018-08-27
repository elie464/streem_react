import React, { Component } from 'react';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

class BarChartComponent extends Component {
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
      <BarChart width={1000} height={500} data={this.props.data}
                margin={{top: 20, right: 30, left: 20, bottom: 5}}>
        <CartesianGrid strokeDasharray="3 3"/>
        <XAxis dataKey="name"/>
        <YAxis/>
        <Tooltip/>
        <Legend />
        {this.props.urls.map((url, index) => (
          <Bar key={index} dataKey={url} stackId="a" fill={this.getRandomColor()} />
        ))}
      </BarChart>
    );
  }
}

export default BarChartComponent;
