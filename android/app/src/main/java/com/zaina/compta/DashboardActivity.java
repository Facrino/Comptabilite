package com.zaina.compta;

import android.os.Bundle;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.core.view.GravityCompat;
import com.zaina.compta.models.Transaction;
import com.google.android.material.navigation.NavigationView;
import android.content.Intent;
import android.view.MenuItem;
import java.util.ArrayList;
import java.util.List;

public class DashboardActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {
    
    private List<Transaction> transactions = new ArrayList<>();
    private TextView tvIncome, tvExpenses, tvResult;
    private DrawerLayout drawerLayout;

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

        updateStats();
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

    private void updateStats() {
        double totalIncome = 0;
        double totalExpenses = 0;

        for (Transaction tx : transactions) {
            // Logique de calcul similaire au web
            totalIncome += tx.getTotalAmount();
        }

        tvIncome.setText(String.format("%.0f Ar", totalIncome));
        tvExpenses.setText(String.format("%.0f Ar", totalExpenses));
        tvResult.setText(String.format("%.0f Ar", totalIncome - totalExpenses));
    }
}
