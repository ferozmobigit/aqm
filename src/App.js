import React,{useState,useEffect} from 'react'
import { Chart } from "react-google-charts";
import './App.css';

function App() {
  const [selectedCity,setSelectedCity] = useState(null)
  const [aqmData,setAqmData] = useState({aqiData:{},tableData:{}})
  const [chartData,setChartData] = useState([])
  const [options,setOptions] = useState({})
  const websock = new WebSocket('wss://city-ws.herokuapp.com/')
  const startTime = Date()
  function updateData(aqiData){
    let dateTime = Date()
    setAqmData(aqmData=>{
      let chartInfo = {...aqmData.aqiData}
      let modifiedData = {...aqmData.tableData}
      for (const aq of aqiData){
        modifiedData[aq.city] = {'city':aq.city,'aqi':aq.aqi,'time':dateTime}
        if (aq.city in chartInfo){
          chartInfo[aq.city].push([dateTime,aq.aqi])
        }
        else{
          chartInfo[aq.city]= [['Time','aqi']]
          chartInfo[aq.city].push([dateTime,aq.aqi])
        }
        if (chartInfo[aq.city].length > 201)
        {
          let first = [['Time','aqi']]
          let latest = [...chartInfo[aq.city].slice(-200)]
          chartInfo[aq.city] = first.concat(latest)
        }
     }
     return {aqiData:chartInfo,tableData:modifiedData}
    }
    )
    
  }
  websock.onopen = () => {
    websock.send('');
  }
  websock.onmessage =(e) => {
    let aqiData = JSON.parse(e.data)
    updateData(aqiData)
  }
  function updateChart(city){
    let data = [...aqmData.aqiData[city]]
    let option = {
      chart: {
        hAxis: { textPosition: 'none' },
        title: "AQI of "+city,
        subtitle: "last "+data.length-1+" record",
      },
    };
    setSelectedCity(city)
    setChartData(chartData=>{return data})
    setOptions(option)
  }

  function getclass(aqi){
      let cls = ''
      if(aqi<=50){
        cls =  'Good'
      }
      else if (aqi>50 && aqi<100){
        cls =  'Satisfactory'
      }
      else if ( aqi>100 && aqi<=200){
        cls =  'Moderate'
      }
      else if ( aqi>200 && aqi<=300){
        cls =  'Poor'
      }
      else if ( aqi>300 && aqi<=400){
        cls =  'VeryPoor'
      }
      else if ( aqi>400 && aqi<=500){
        cls =  'Severe'
      }
      return cls
  }
  return (
    <div className="App">
      <header className="App-header">
        <a>
          Air Quality measurement
        </a>
      </header>
      <table>
        <thead>
          <th>
            City
          </th>
          <th>
            AQI
          </th>
          <th>
            Last Updated
          </th>
        </thead>
        <tbody>
          {Object.values(aqmData.tableData).map((aqm)=>(
            <tr className={getclass(aqm.aqi)} onClick={() => updateChart(aqm.city)}>
              <td>{aqm.city}</td>
              <td>{aqm.aqi}</td>
              <td>{aqm.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {selectedCity &&
        <Chart
          chartType="Line"
          width="100%"
          height="400px"
          data={chartData}
          options={options}
        />
      }
    </div>
  );
}

export default App;
