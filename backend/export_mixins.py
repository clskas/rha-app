import csv
from django.http import HttpResponse


class CSVExportMixin:
    csv_filename = 'export.csv'
    csv_fields = []

    def export_csv(self, request, queryset):
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = f'attachment; filename="{self.csv_filename}"'
        writer = csv.writer(response)
        if self.csv_fields:
            writer.writerow([h for h, _ in self.csv_fields])
            for obj in queryset:
                row = []
                for _, getter in self.csv_fields:
                    if callable(getter):
                        val = getter(obj)
                    else:
                        val = getattr(obj, getter, '')
                    row.append(str(val) if val is not None else '')
                writer.writerow(row)
        return response
