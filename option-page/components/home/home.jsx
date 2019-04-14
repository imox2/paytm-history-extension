import React, { Component } from "react";
import introJs from 'intro.js';
import 'intro.js/introjs.css';
import Lottie from 'lottie-react-web'
import loader from './loader'
import HeaderComponent from "../header";
import Overview from "./overview";
import Charts from "./charts";

import Db  from '../../../src/utils/db';
import { Api } from "../../../src/utils/api";
import Modal from "../../../src/utils/modal";

const db = new Db();
const api = new Api();
const modal = new Modal();

export default class Home extends Component {
  state = {
    isDataMounted: false ,
    totalSpent: 0,
    totalAdded: 0,
    frequentTransactionTo: [],
    frequentTransactionFrom: [],
    showChart: false,
    statData: null,
    userData: null,
    loaded: false
  };

  constructor(props) {
    super(props);
  }

  componentDidMount () {
      setTimeout(() => {
        this.setState({loaded: true})
      },3000)
    /** check if data was fetched previously */
    db.get(["userData","stats","help"])
      .then(res=>{
        this.setState({
          userData: res.userData,
          totalAdded: String(res.userData.totalAdded),
          totalSpent: String(res.userData.totalSpent),
          frequentTransactionTo: res.userData.userTxnFrequencyTo ,
          frequentTransactionFrom: res.userData.userTxnFrequencyFrom,
          statData: res.stats
        });
        if(res.help === true) {
          introJs().start();
          db.set({help: false})
        }
      })
      .catch(e=>{
        console.log(e);
      })
  }
  render() {

    return (
      this.state.loaded?(<React.Fragment>
        <HeaderComponent/>
        {/*overview boxes*/}
        <Overview
          totalSpent={this.state.totalSpent}
          totalAdded={this.state.totalAdded}
          frequentTransactionTo={this.state.frequentTransactionTo}
          frequentTransactionFrom={this.state.frequentTransactionFrom}
          userData={this.state.userData}
        />
        {/*basic charts*/}
        <Charts data={this.state.statData}/>
      </React.Fragment>):(
        <React.Fragment>
          <Lottie
            options={{
              animationData: loader
            }}
          />
        </React.Fragment>
      )
    );
  }
}
