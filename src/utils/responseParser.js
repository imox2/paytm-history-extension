import * as dayjs from 'dayjs'
import { Api } from './api';
import Modal from "./modal";

const api = new Api()
const modal = new Modal()

const compareDate = (dString1,dString2)=>{
  const d1 = new Date(dString1);
  d1.setHours(0,0,0,0);
  const d2 = new Date(dString2);
  d2.setHours(0,0,0,0);
  return (d1.getTime() === d2.getTime());
}

export const txnParser = async () => {
  return api.fetchTxHistory()
    .then(res=> {
      let totalSpent = 0 , totalAdded = 0;
      console.log(api.TxHistoryData);
      const dateDataMonthlySpent = modal.dateProxy();
      const transactionWithFreqTo = modal.proxy();
      const userTxnFrequencyFrom = modal.proxy();
      const result = api.TxHistoryData.map(thd=> {
        if (thd.statusCode === "SUCCESS") {
          thd.response.map(order=> {
            if (order.txnStatus === "SUCCESS") {
              if (order.txntype === "DR") {
                transactionWithFreqTo[order.txnTo]++;
                totalSpent+= order.extendedTxnInfo[0].amount;
                let dayJsCalculation = dayjs(order.txndate);
                /** add spent money monthly wise in dateDataMonthlySpent to further show on graph */
                dateDataMonthlySpent[dayJsCalculation.year()][dayJsCalculation.month()]+= order.extendedTxnInfo[0].amount;
              }
              else if (order.txntype === "CR") {
                userTxnFrequencyFrom[order.txnFrom]++
                totalAdded+= order.extendedTxnInfo[0].amount;
              }
            }
          });
        }
      });
      console.log("dateDataMonthlySpent",dateDataMonthlySpent);
      return {
        /** 0: if not logged in. 1 if logged in */
        dataMounted: true,
        /** last time when apis was hit successfully */
        lastChecked: +new Date,
        /** user data fetched from apis */
        userData: {
          /**username not mandatory*/
          userName: null,
          /** total spent money by user based on history calculations */
          totalSpent: totalSpent,
          /** total money added to paytm wallet by user*/
          totalAdded: totalAdded ,
          /** users transactions with frequency to {user: frequency}*/
          userTxnFrequencyTo: transactionWithFreqTo ,
          /** users transactions with frequency from {user: frequency}*/
          userTxnFrequencyFrom: userTxnFrequencyFrom ,
          /** extra user details */
          extDetails: null,
          /** Api's original response*/
          apiOriginalResponse: api.TxHistoryData
        },
        /** monthly analysis calculations */
        stats: dateDataMonthlySpent
      };
    });
}

export const txnParserCalendarEventsInput = async (apiOriginalResponse) => {
  const events = [];
  let lastTxnDate= new Date();
  let totalSpentInDay = 0;
  const resp = {
    id: 0,
    title: '',
    start: null,
    end: new Date(2000, 1, 1),
    total: 0
  };
  const result = apiOriginalResponse.map(thd=> {
    if (thd.statusCode === "SUCCESS") {
      thd.response.map(order=> {
        if (order.txnStatus === "SUCCESS") {
          if (order.txntype === "DR") {
            if (resp.start === null) {
              lastTxnDate=order.txndate;
              resp.start = order.txndate;
            }
            if (compareDate(resp.start,order.txndate)) {
              resp.total+=Number(order.extendedTxnInfo[0].amount);
            } else {
              resp.start = order.txndate;
              resp.end = resp.start;
              resp.total=Number(order.extendedTxnInfo[0].amount);
              resp.title = String(resp.total )+" ₹";
              let tempDate = new Date(resp.start);
              tempDate.setHours(0,0,0);
              events.push({
                id: resp.id,
                start: tempDate,
                end: tempDate,
                title: resp.title
              });
              resp.id++;
              resp.total=0;
            }
          }
          else if (order.txntype === "CR") {
          }
        }
      });
    }
  });
  return {
    events: events,
    lastTxnDate: lastTxnDate
  };
}
