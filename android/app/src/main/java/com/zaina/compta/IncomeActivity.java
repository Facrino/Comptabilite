package com.zaina.compta;

import android.os.Bundle;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;

import com.zaina.compta.services.DataService;

public class IncomeActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_income);

        Toolbar toolbar = findViewById(R.id.toolbar_income);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setDisplayHomeAsUpEnabled(true);
        }
        toolbar.setNavigationOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                finish();
            }
        });
        
        setupAccordion();
        loadData();
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadData();
    }

    private void setupAccordion() {
        setupToggle(R.id.layout_production_header, R.id.layout_production_details, R.id.iv_prod_arrow);
        setupToggle(R.id.layout_consommation_header, R.id.layout_consommation_details, R.id.iv_cons_arrow);
        setupToggle(R.id.layout_va_header, R.id.layout_va_details, R.id.iv_va_arrow);
        setupToggle(R.id.layout_ebe_header, R.id.layout_ebe_details, R.id.iv_ebe_arrow);
        setupToggle(R.id.layout_operating_header, R.id.layout_operating_details, R.id.iv_operating_arrow);
        setupToggle(R.id.layout_financial_header, R.id.layout_financial_details, R.id.iv_financial_arrow);
        setupToggle(R.id.layout_before_tax_header, R.id.layout_before_tax_details, R.id.iv_before_tax_arrow);
        setupToggle(R.id.layout_exceptional_header, R.id.layout_exceptional_details, R.id.iv_exceptional_arrow);
    }

    private void setupToggle(int headerId, final int detailsId, final int arrowId) {
        View header = findViewById(headerId);
        if (header == null) return;
        
        header.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                View details = findViewById(detailsId);
                View arrow = findViewById(arrowId);
                if (details != null) {
                    if (details.getVisibility() == View.VISIBLE) {
                        details.setVisibility(View.GONE);
                        if (arrow != null) arrow.setRotation(0);
                    } else {
                        details.setVisibility(View.VISIBLE);
                        if (arrow != null) arrow.setRotation(180);
                    }
                }
            }
        });
    }

    private void loadData() {
        DataService ds = DataService.getInstance();
        double production = ds.getProduction();
        double consommation = ds.getConsommation();
        double va = production - consommation;
        double personnel = ds.getPersonnelCosts();
        double ebe = va - personnel;
        double operatingExp = ds.getOperatingExpenses();
        double rex = ebe - operatingExp;
        double finRes = ds.getFinancialResult();
        double rcai = rex + finRes;
        double exceptional = ds.getExceptionalResult();
        double net = ds.getNetResult();
        
        updateText(R.id.tv_val_production_total, String.format("%.0f Ar", production));
        updateText(R.id.tv_val_consommation_total, String.format("-%.0f Ar", consommation));
        
        updateText(R.id.tv_val_va, String.format("%.0f Ar", va));
        updateText(R.id.tv_val_va_prod, String.format("%.0f Ar", production));
        updateText(R.id.tv_val_va_cons, String.format("-%.0f Ar", consommation));
        
        updateText(R.id.tv_val_ebe, String.format("%.0f Ar", ebe));
        updateText(R.id.tv_val_ebe_va, String.format("%.0f Ar", va));
        updateText(R.id.tv_val_ebe_staff, String.format("-%.0f Ar", personnel));
        updateText(R.id.tv_val_staff, String.format("-%.0f Ar", personnel));
        
        updateText(R.id.tv_val_operating_total, String.format("%.0f Ar", rex));
        updateText(R.id.tv_val_financial_total, String.format("%.0f Ar", finRes));
        updateText(R.id.tv_val_before_tax, String.format("%.0f Ar", rcai));
        updateText(R.id.tv_val_bt_operating, String.format("%.0f Ar", rex));
        updateText(R.id.tv_val_bt_financial, String.format("%.0f Ar", finRes));
        
        updateText(R.id.tv_val_exceptional_total, String.format("%.0f Ar", exceptional));
        updateText(R.id.tv_val_net, String.format("%.0f Ar", net));
    }

    private void updateText(int id, String text) {
        TextView tv = findViewById(id);
        if (tv != null) {
            tv.setText(text);
        }
    }
}
