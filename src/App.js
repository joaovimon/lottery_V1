import React,{ Component} from 'react';
import './App.css';
import web3 from './web3';
import lottery from './lottery';
import Header from './components/Header';

class App extends Component {
  state={
    manager: '',
    players: [],
    balance: '',
    value: '',
    message: '',
    lastWinner: '',
    lastBalance: ''
  }
/*  Equivalente a:
    constructor(props){
    super(props);
    this.state={manager: ''};
  }
*/

  // o método componentDidMount() é sempre chamado qquando o componente é
  // renderizado
  async componentDidMount(){
    try{
      const manager = await lottery.methods.manager().call();
      const players = await lottery.methods.getPlayers().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      const lastWinner = await lottery.methods.lastWinner().call();

      this.setState({manager, players, balance});
    } catch(error){
      console.log(error);
    }
  }

  onSubmit = async (event) => {
    event.preventDefault(); //evita que o evento venha em HTML

    const accounts = await web3.eth.getAccounts();
    this.setState({message: 'Waiting on transaction success...'});
    await lottery.methods.enter().send({
      from: accounts[0],
      value: web3.utils.toWei(this.state.value, 'ether')
    });
    this.setState({message: 'You have been entered!'})
  };
/* ou
   onSubmit(){

  }
*/

  onClick = async() => {
    const accounts = await web3.eth.getAccounts();

    this.setState({message: 'Waiting on transaction success...'});
    const balance = await web3.eth.getBalance(lottery.options.address);
    console.log(balance);
    await lottery.methods.pickWinner().send({
      from: accounts[0]
    });
    this.lastWinner = await lottery.methods.lastWinner().call();
    const winnerCongratsString = 'A winner has been picked!\n The Winner is ' +
                                  this.lastWinner +
                                  '\nTotal amount of reward: ' +
                                  web3.utils.fromWei(balance, 'ether') + 'ether!';
    this.setState({message: winnerCongratsString});
  };
  /*
  const winnerCongratsString = string.concat('A winner has been picked! The Winner is ',
                                  this.lastWinner,
                                  'Total amount of reward: ', Number(lastBalance));*/
  render(){/*   para confirmar que a wallet da metamask tinha injectado o Web3
    com sucesso (nova versao que supostamente vai ser compativel no futuro)
    web3.eth.getAccounts()
      .then(console.log);
*/
    return (
      <div>
          <div><Header></Header></div>
        <h2>Lottery Contract</h2>
       <p>
         This contract is managed by {this.state.manager}.
         There are currently {this.state.players.length} people entered,
         competing to win {web3.utils.fromWei(this.state.balance, 'ether')} ether!
       </p>
       <hr />
       <form onSubmit={this.onSubmit}>
         <h4>Want to try your luck?</h4>
         <div>
           <label>Amount of ether to enter</label>
           <input
             value={this.state.value}
             onChange={event => this.setState({value: event.target.value})}
           />
         </div>
         <button>Enter</button>
       </form>
       <hr />
         <h4>Ready to pick a winner?</h4>
         <button onClick={this.onClick}>Pick a winner!</button>
       <hr />
       <h1>{this.state.message}</h1>
     </div>
    );
  }
}


export default App;
