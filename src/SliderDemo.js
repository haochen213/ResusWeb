import React, {Component} from "react";
import {Form, Grid, Image} from "semantic-ui-react";
import {open} from 'rosbag';
import Plot from 'react-plotly.js';
import ReactDOM from "react-dom/client";
const pigs = [
  "2022-09-20--20-24-20",
  "2022-10-06--20-13-38",
  "2022-11-10--21-20-31",
  "2022-11-10--21-25-57",
  "2023-01-19--22-49-09",
  "2023-02-09--21-11-23",
  "new"
]

const options = pigs.map((p) => ({
  key: p,
  text: `Pig ${p}`,
  value: p
}))

export default class SliderDemo extends Component {
  state = { pig: pigs[0], index: 1 };
  handleChange = (
    _e,
    { name, value }
  ) => this.setState({ [name]: value });
  


  async draw(file){
    console.log("function called");
    const bag = await open(file);
    var best_marker_points = new Array(Number);
    var most_points = -1;
    var best_color = new Array(Number);
    // var best_angle = new Array(Number);
    await bag.readMessages({ topics: ['/ultrasound_reconstruction'] }, (result) => {
      var points = [];
      var colors = [];
      var angles = [];
      console.log(result.message);
      for(var i = 0; i < result.message.markers.length; i++){
        var color = Math.random();
        for(var j = 0; j < result.message.markers[i].points.length; j++){
          points.push(result.message.markers[i].points[j]);
          colors.push(color);
          angles.push();
        }
        if(points.length > most_points){
          best_marker_points = points;
			    most_points = points.length;
          best_color = colors;
          best_angle = angles;
        }
      }
    });

    console.log(best_marker_points.length);
    console.log(best_marker_points.length % 3);
    var x = [];
    var y = [];
    var z = [];
    for(var i = 0; i < best_marker_points.length; i++){
      x.push(best_marker_points[i].x);
      y.push(best_marker_points[i].y);
      z.push(best_marker_points[i].z);
    }
    
    var a = [];
    var b = [];
    var c = [];
    for(i = 0; i < best_marker_points.length; i++){
      if(i % 3 === 0){
        a.push(i);
      }else if(i % 3 === 1){
        b.push(i);
      }else{
        c.push(i);
      }
    }

    // var data = {x : x, y : y, z : z, i : a, j : b, k : c, 
    //  alphahull: 5, opacity: 1, intensity: best_color, color: 'cyan', type: 'mesh3d'};
    // @ts-ignore
    var graph= (<Plot data={[
      {
        type: "mesh3d",
        x: x,
        y: y,
        z: z,
        opacity: 1,
        alphahull: 5,
        i : a,
        j: b,
        k : c,
        intensity: best_color,
        color: 'cyan',
        // text: best_angle,
        // hovertemplate: "Kinematics Angle: %{text}"
      }
    ]}
    layout={ {width: 500, height: 500, title: 'Model'} } />);

    const graphPlace = ReactDOM.createRoot(
      document.getElementById("graphDiv")
    );
    graphPlace.render(graph);
  }


  render() {
    const { pig, index } = this.state;
    if(pig.localeCompare(pigs[6]) !== 0){
      const pig_path = `${process.env.PUBLIC_URL}/data/newImages/${pig}`;
      const perf = `${pig_path}/experiment.html`;
      return (
        <Grid centered columns={3}>
          <Grid.Column textAlign="center">
          <Image src={`${pig_path}/frames/${index}.png`} centered/>
            <p>Sliced ultrasound image from reconstructed volume</p>
          </Grid.Column>
          <Grid.Column textAlign="center" as={Form}>
            <iframe title='mytitle' src={perf} width='500px' height='500px' loading="lazy"></iframe>
            <Form.Input
              min={1}
              max={200}
              name="index"
              onChange={this.handleChange}
              step={1}
              type="range"
              value={index}
            />
            <Form.Dropdown
              label="Select a pig ultrasound reconstruction:"
              name="pig"
              onChange={this.handleChange}
              options={options}
              value={pig}
            />
          </Grid.Column>
          <Grid.Column textAlign="center">
            <Image src={`${pig_path}/labels/${index}.png`} centered />
            <p>Sliced label from reconstructed volume</p>
          </Grid.Column>
        </Grid>
      );
    }else{
      return (
        <Grid centered columns={3}>
          <Grid.Column textAlign="center">
            <form className="processFile">
              {/* onSubmit={this.draw} */}
              <label>
               ROSbag File:<br /><br />
               <input type="file" accept=".bag" id="inputFile" onChange={(e) => this.draw(e.target.files[0])} />
             </label>
            </form>
             <div id="graphDiv"></div>
            <Form.Dropdown
              label="Select a pig ultrasound reconstruction:"
              name="pig"
              onChange={this.handleChange}
              options={options}
              value={pig}
            />
          </Grid.Column>
        </Grid>
      );
    }
  }
}