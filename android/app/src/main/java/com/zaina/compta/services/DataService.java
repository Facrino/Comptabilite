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
                if (line.getAccountCode().startsWith("70") || 
                    line.getAccountCode().startsWith("71") || 
                    line.getAccountCode().startsWith("72")) {
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
                if (line.getAccountCode().startsWith("60") || 
                    line.getAccountCode().startsWith("61") || 
                    line.getAccountCode().startsWith("62")) {
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

    public double getAssetTotal() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                // Simplified asset logic: accounts starting with 2, 3, 5
                if (line.getAccountCode().startsWith("2") || 
                    line.getAccountCode().startsWith("3") || 
                    line.getAccountCode().startsWith("5")) {
                    total += line.getDebit() - line.getCredit();
                }
            }
        }
        return total;
    }

    public double getLiabilityTotal() {
        double total = 0;
        for (Transaction tx : transactions) {
            for (JournalLine line : tx.getLines()) {
                // Simplified liability logic: accounts starting with 1, 4
                if (line.getAccountCode().startsWith("1") || 
                    line.getAccountCode().startsWith("4")) {
                    total += line.getCredit() - line.getDebit();
                }
            }
        }
        return total;
    }
}
