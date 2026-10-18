import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { expect, it } from 'vitest';
import messages from '../messages/en.json';
import { catalog } from '@/content/catalog';
import { CatalogGrid } from '@/components/lesson/catalog-grid';

it.each([false, true])(
  'paid tiles reflect five-year access=%s while free tiles remain free',
  (allAccess) => {
    const lessons = catalog.filter((l) =>
      ['bubble-sort', 'merge-sort'].includes(l.slug),
    );
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <CatalogGrid lessons={lessons} allAccess={allAccess} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText('Free', { exact: true })).toBeVisible();
    if (allAccess)
      expect(screen.queryByLabelText('Requires five-year access')).toBeNull();
    else
      expect(screen.getByLabelText('Requires five-year access')).toBeVisible();
    if (allAccess)
      expect(
        screen.getByLabelText('Included in your five-year access'),
      ).toBeVisible();
  },
);
