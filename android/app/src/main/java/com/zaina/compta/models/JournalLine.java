package com.zaina.compta.models;

public class JournalLine {
    private String accountCode;
    private String accountLabel;
    private double debit;
    private double credit;

    public JournalLine(String accountCode, String accountLabel, double debit, double credit) {
        this.accountCode = accountCode;
        this.accountLabel = accountLabel;
        this.debit = debit;
        this.credit = credit;
    }

    public String getAccountCode() { return accountCode; }
    public String getAccountLabel() { return accountLabel; }
    public double getDebit() { return debit; }
    public double getCredit() { return credit; }
}
