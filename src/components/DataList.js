import React from 'react';

const DataList = ({ data }) => {
  return (
    <div className="data-list">
      <h2>6MWT Data:</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Cone Distance</th>
            <th>ID</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>{data.test.date.split('T')[0]}</td>
            <td>{data.test.date.split('T')[1]}</td>
            <td>{data.test.cone_distance} mts</td>
            <td>{data.test.tid}</td>
          </tr>
        </tbody>
      </table>

      <h3>Anthropometric values</h3>
      <table>
        <tbody>
          <tr>
            <td>Gender</td>
            <td>Female</td>
          </tr>
          <tr>
            <td>Age</td>
            <td>{data.test.age} y</td>
          </tr>
          <tr>
            <td>Weight</td>
            <td>{data.test.weight} kg</td>
          </tr>
          <tr>
            <td>Height</td>
            <td>{data.test.height} cm</td>
          </tr>
        </tbody>
      </table>

      <h3>Comments</h3>
      <p>{data.final.comment}</p>
    </div>
  );
};

export default DataList;
