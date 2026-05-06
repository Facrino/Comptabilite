package com.zaina.compta.models;

import java.util.List;

public class Transaction {
    private String id;
    private String date;
    private String label;
    private List<JournalLine> lines;

    public Transaction(String id, String date, String label, List<JournalLine> lines) {
        this.id = id;
        this.date = date;
        this.label = label;
        this.lines = lines;
    }

    public String getDate() { return date; }
    public String getLabel() { return label; }
    public List<JournalLine> getLines() { return lines; }
    
    public double getTotalAmount() {
        double total = 0;
        for (JournalLine line : lines) {
            total += line.getDebit();
        }
        return total;
    }
}
