import { useEffect } from 'react';
import { useDispatch } from 'react-redux'
import config from '../config.json'
import Navbar from './Navbar';
import { loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange } from '../store/interactions'



function App() {
  const dispatch = useDispatch()

  const loadBlockChainData = async () => {
    // Connect ethers to blockchain
    const provider = loadProvider(dispatch)
    const chainId = await loadNetwork(provider, dispatch)

    // Reload page when network changes
    window.ethereum.on('chainChanged', () => {
      window.location.reload()
    })

    // Fetch current account/balance when account changes
    window.ethereum.on('accountsChanged', async () => {
      await loadAccount(provider, dispatch)
    })

    // Token Smart contract
    const dAPP = config[chainId].dAPP
    const mETH = config[chainId].mETH
    await loadTokens(provider, [dAPP.address, mETH.address], dispatch)

    const exchangeConfig = config[chainId].exchange
    // Load Exchange
    await loadExchange(provider, exchangeConfig.address, dispatch)

  }

  useEffect(() => {
    loadBlockChainData()
  })
  return (
    <div>

      <Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App;
