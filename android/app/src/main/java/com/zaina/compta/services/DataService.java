package com.zaina.compta.services;

import com.zaina.compta.models.JournalLine;
import com.zaina.compta.models.Transaction;
import java.util.ArrayList;
import java.util.List;

public class DataService {
    private static DataService instance;
    private List<Transaction> transactions;

    private DataService() {
        transactions = new ArrayList<>();
        // Initial mock data
        List<JournalLine> lines1 = new ArrayList<>();
        lines1.add(new JournalLine("512100", "Banque", 10000, 0));
        lines1.add(new JournalLine("707100", "Ventes", 0, 10000));
        transactions.add(new Transaction("1", "2024-05-01", "Vente initiale", lines1));

        List<JournalLine> lines2 = new ArrayList<>();
        lines2.add(new JournalLine("601100", "Achats", 50000, 0));
        lines2.add(new JournalLine("512100", "Banque", 0, 50000));
        transactions.add(new Transaction("2", "2024-05-02", "Achat marchandises", lines2));
    }

    public static synchronized DataService getInstance() {
        if (instance == null) {
            instance = new DataService();
        }
        return instance;
    }

    public List<Transaction> getTransactions() {
        return transactions;
    }

    public void addTransaction(Transaction transaction) {
        transactions.add(0, transaction);
    }

    public double getTotalIncome() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("7")) {
                    total += line.getCredit() - line.getDebit();
                }
            }
        }
        return total;
    }

    public double getTotalExpenses() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("6")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getProduction() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                String code = line.getAccountCode();
                if (code.startsWith("70") || code.startsWith("71") || code.startsWith("72")) {
                    total += line.getCredit() - line.getDebit();
                }
            }
        }
        return total;
    }

    public double getConsommation() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                String code = line.getAccountCode();
                if (code.startsWith("60") || code.startsWith("61") || code.startsWith("62")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getPersonnelCosts() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("64")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getOperatingExpenses() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                String code = line.getAccountCode();
                if (code.startsWith("63") || code.startsWith("68") || code.startsWith("65")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getFinancialResult() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                String code = line.getAccountCode();
                if (code.startsWith("76")) {
                    total += line.getCredit() - line.getDebit();
                } else if (code.startsWith("66")) {
                    total -= line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getExceptionalResult() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                String code = line.getAccountCode();
                if (code.startsWith("77")) {
                    total += line.getCredit() - line.getDebit();
                } else if (code.startsWith("67")) {
                    total -= line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getNetResult() {
        return getProduction() - getConsommation() - getPersonnelCosts() - getOperatingExpenses() + getFinancialResult() + getExceptionalResult();
    }

    public double getImmobilisatons() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("2")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getStocks() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("3")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getDisponibilites() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("5")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getCapitauxPropres() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("10") || line.getAccountCode().startsWith("11") || line.getAccountCode().startsWith("12")) {
                    total += line.getCredit() - line.getDebit();
                }
            }
        }
        return total;
    }

    public double getDettesLT() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("16")) {
                    total += line.getCredit() - line.getDebit();
                }
            }
        }
        return total;
    }

    public double getDettesCT() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                if (line.getAccountCode().startsWith("4")) {
                    total += line.getCredit() - line.getDebit();
                }
            }
        }
        return total;
    }
}
