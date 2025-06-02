import { auth } from "~/server/auth";
import { Header } from "../_components/header";
import { AddTransactionForm } from "../_components/transaction/addTransaction";
import { TransactionList } from "../_components/transaction/transactionList";


export default async function TransactionPage() {

  return (
    <>
      <Header title={"Транзакции"} />
      <AddTransactionForm />
      <TransactionList />
    </>
  );
}
