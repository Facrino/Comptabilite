package com.zaina.compta;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.core.view.GravityCompat;
import com.zaina.compta.models.Transaction;
import com.zaina.compta.services.DataService;
import com.zaina.compta.adapters.RecentTransactionsAdapter;
import com.google.android.material.navigation.NavigationView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import android.content.Intent;
import android.view.MenuItem;
import java.util.List;

public class DashboardActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {
    
    private TextView tvIncome, tvExpenses, tvResult;
    private DrawerLayout drawerLayout;
    private RecyclerView rvTransactions;
    private RecentTransactionsAdapter adapter;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_dashboard);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        drawerLayout = findViewById(R.id.drawer_layout);
        NavigationView navigationView = findViewById(R.id.nav_view);
        navigationView.setNavigationItemSelectedListener(this);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawerLayout, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawerLayout.addDrawerListener(toggle);
        toggle.syncState();

        tvIncome = findViewById(R.id.tv_income);
        tvExpenses = findViewById(R.id.tv_expenses);
        tvResult = findViewById(R.id.tv_result);
        rvTransactions = findViewById(R.id.rv_recent_transactions);

        rvTransactions.setLayoutManager(new LinearLayoutManager(this));
        
        updateUI();
    }

    @Override
    protected void onResume() {
        super.onResume();
        updateUI();
    }

    private void updateUI() {
        DataService ds = DataService.getInstance();
        double totalIncome = ds.getTotalIncome();
        double totalExpenses = ds.getTotalExpenses();

        tvIncome.setText(String.format("%.0f Ar", totalIncome));
        tvExpenses.setText(String.format("%.0f Ar", totalExpenses));
        tvResult.setText(String.format("%.0f Ar", totalIncome - totalExpenses));

        List<Transaction> transactions = ds.getTransactions();
        adapter = new RecentTransactionsAdapter(transactions);
        rvTransactions.setAdapter(adapter);
    }

    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        int id = item.getItemId();

        if (id == R.id.nav_dashboard) {
            // Already here
        } else if (id == R.id.nav_operations) {
            startActivity(new Intent(this, OperationsActivity.class));
        } else if (id == R.id.nav_income) {
            startActivity(new Intent(this, IncomeActivity.class));
        } else if (id == R.id.nav_balance) {
            startActivity(new Intent(this, BalanceActivity.class));
        }

        drawerLayout.closeDrawer(GravityCompat.START);
        return true;
    }
}
