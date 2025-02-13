import {
  DAPP_ADDRESS,
  APTOS_FAUCET_URL,
  APTOS_NODE_URL
} from "../config/constants";
import { useWallet } from "@manahippo/aptos-wallet-adapter";
import { MoveResource } from "@martiandao/aptos-web3-bip44.js/dist/generated";
import { useState } from "react";
import React from "react";
import {
  AptosAccount,
  WalletClient,
  HexString,
  AptosClient,
} from "@martiandao/aptos-web3-bip44.js";

import { CodeBlock } from "../components/CodeBlock";

import newAxios from "../utils/axios_utils";

// import { TypeTagVector } from "@martiandao/aptos-web3-bip44.js/dist/aptos_types";
// import {TypeTagParser} from "@martiandao/aptos-web3-bip44.js/dist/transaction_builder/builder_utils";
export default function Home() {

  const { account, signAndSubmitTransaction } = useWallet();
  const client = new WalletClient(APTOS_NODE_URL, APTOS_FAUCET_URL);
  const [resource, setResource] = React.useState<MoveResource>();
  const [resource_v2, setResourceV2] = React.useState();
  const [formInput, updateFormInput] = useState<{
    description: string;
    resource_path: string;
    addr_type: number;
    addr: string;
    pubkey: string;
    addr_description: string;
    chains: Array<string>;

  }>({
    description: "",
    resource_path: "",
    addr_type: 0,
    addr: "",
    pubkey: "",
    addr_description: "",
    chains: [],
  });

  async function create_did() {
    await signAndSubmitTransaction(
      init_addr_aggr(),
      { gas_unit_price: 100 }
    );
  }

  async function create_addr() {
    await signAndSubmitTransaction(
      add_addr(),
      { gas_unit_price: 100 }
    );
  }

  async function get_resources() {
    client.aptosClient.getAccountResources(account!.address!.toString()).then(value =>
      console.log(value)
    );
  }

  async function get_table() {
    // client.aptosClient.getTableItem()
  }

  async function get_resource() {
    const { description, resource_path, addr_type, addr, pubkey, addr_description, chains } = formInput;
    console.log(client.aptosClient.getAccountResource(account!.address!.toString(), resource_path));
  }

  async function faas_test() {
    newAxios.post(
      '/api/v1/run?name=DID.Renderer&func_name=get_module_doc',
      {
        "params": [
        ]
      },
    ).then(
      value => {
        console.log(value.data);
      }
    );
  }
  async function get_did_resource_v2() {
    newAxios.post(
      '/api/v1/run?name=DID.Renderer&func_name=gen_did_document',
      { "params": [account!.address!.toString()] },
    ).then(
      value => {
        console.log(value.data)
        setResourceV2(value.data)
      }
    );
  }

  async function get_did_resource() {

    client.aptosClient.getAccountResource(account!.address!.toString(), DAPP_ADDRESS + "::addr_aggregator::AddrAggregator").then(
      setResource
    );
  }

  function log_acct() {
    console.log(resource)
    console.log(account!.address!.toString());
  }

  function init_addr_aggr() {
    const { description, resource_path, addr_type, addr, pubkey, addr_description, chains } = formInput;
    return {
      type: "entry_function_payload",
      function: DAPP_ADDRESS + "::addr_aggregator::create_addr_aggregator",
      type_arguments: [],
      arguments: [
        0,
        description
      ],
    };
  }

  function add_addr() {
    const { description, resource_path, addr_type, addr, pubkey, addr_description, chains } = formInput;
    return {
      type: "entry_function_payload",
      function: DAPP_ADDRESS + "::addr_aggregator::add_addr",
      type_arguments: [],
      arguments: [
        addr_type,
        addr,
        pubkey,
        chains,
        addr_description,

      ],
    };
  }

  return (
    <div>
      <p><b>Module Path:</b> {DAPP_ADDRESS}::addr_aggregator</p>
      <input
        placeholder="Description for your DID"
        className="mt-8 p-4 input input-bordered input-primary w-full"
        onChange={(e) =>
          updateFormInput({ ...formInput, description: e.target.value })
        }
      />
      <br></br>
      <button
        onClick={create_did}
        className={
          "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
        }>
        Init AddrAggr in DID Contract
      </button>
      <br></br>
      <br></br>
      <button
        onClick={get_did_resource_v2}
        className={
          "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
        }>
        Get DID Resource
      </button>
      {resource_v2 && (
        <CodeBlock code={resource_v2} />
      )}
      <br></br>
      <select
        value={formInput.addr_type}
        onChange={(e) => {
          updateFormInput({ ...formInput, addr_type: parseInt(e.target.value) })
        }}
      >
        <option value="0">Ethereum Type Addr</option>
        <option value="1">Aptos Type Addr</option>
      </select>
      <br></br>
      <input
        placeholder="Addr"
        className="mt-8 p-4 input input-bordered input-primary w-full"
        onChange={(e) =>
          updateFormInput({ ...formInput, addr: e.target.value })
        }
      />
      <br></br>
      <input
        placeholder="Pubkey(Optional)"
        className="mt-8 p-4 input input-bordered input-primary w-full"
        onChange={(e) =>
          updateFormInput({ ...formInput, pubkey: e.target.value })
        }
      />
      <br></br>
      <input
        placeholder="Addr Description"
        className="mt-8 p-4 input input-bordered input-primary w-full"
        onChange={(e) =>
          updateFormInput({ ...formInput, addr_description: e.target.value })
        }
      />
      <br></br>
      <input
        placeholder="Chains"
        className="mt-8 p-4 input input-bordered input-primary w-full"
        onChange={(e) =>
          updateFormInput({ ...formInput, chains: JSON.parse(e.target.value) })
        }
      />
      <br></br>
      <button
        onClick={create_addr}
        className={
          "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
        }>
        Add Addr
      </button>
      <br></br>
      <button
        // onClick={create_addr}
        className={
          "btn btn-primary font-bold mt-4  text-white rounded p-4 shadow-lg"
        }>
        Update Addr
      </button>
    </div>
  );
}
