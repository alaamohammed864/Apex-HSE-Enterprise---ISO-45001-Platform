/**
 * Automated Verification Script for Phase 3 — Dynamic HSE Document Template Builder
 * Tests:
 * 1. Create template
 * 2. Add sections
 * 3. Add fields across multiple types
 * 4. Save template
 * 5. Create document from template
 * 6. Edit document values
 * 7. Save document
 * 8. Reload document
 * 9. Verify data persistence
 */

import { TemplateManagementService } from '../src/services/templateService';
import { DynamicDocumentTemplateConfig, FormFieldConfig } from '../src/types/formFieldConfig';

async function runTest() {
  console.log('--- STARTING DYNAMIC TEMPLATE BUILDER WORKFLOW VERIFICATION ---');

  // Step 1: Initialize service and fetch seed templates
  console.log('Step 1: Initializing TemplateManagementService...');
  await TemplateManagementService.init();
  const initialTemplates = await TemplateManagementService.getAllTemplates();
  console.log(`✓ Initial templates loaded: ${initialTemplates.length} templates available.`);
  if (initialTemplates.length === 0) {
    throw new Error('Expected seed templates to be loaded!');
  }

  // Step 2: Create a new custom template
  console.log('\nStep 2: Creating a new custom template...');
  const testTmplId = `tmpl-test-${Date.now()}`;
  const customTemplate: DynamicDocumentTemplateConfig = {
    id: testTmplId,
    code: 'TMPL-HSE-TEST-01',
    title: 'Offshore Helicopter Deck Rigorous Inspection Protocol',
    titleAr: 'بروتوكول تفتيش مهبط طائرات الهليكوبتر البحرية',
    category: 'FORMS',
    isoClause: '8.1.2',
    description: 'Mandatory pre-flight and emergency crash rescue readiness protocol.',
    descriptionAr: 'بروتوكول الجاهزية لحالات الطوارئ قبل الهبوط المروحي.',
    version: '1.0',
    status: 'PUBLISHED',
    createdBy: 'Lead Safety Engineer',
    updatedBy: 'Lead Safety Engineer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [],
  };

  // Step 3: Add sections
  console.log('Step 3: Adding Sections to template...');
  const sec1Id = `sec-helideck-general-${Date.now()}`;
  const sec2Id = `sec-helideck-controls-${Date.now()}`;

  customTemplate.sections.push({
    id: sec1Id,
    title: '1. Helideck Location & Wind Conditions',
    titleAr: '1. موقع المهبط وسرعة الرياح',
    description: 'Environmental telemetry and location identifiers.',
    order: 1,
    isMandatory: true,
    fields: [],
  });

  customTemplate.sections.push({
    id: sec2Id,
    title: '2. Fire Foam & Rescue Equipment Verification',
    titleAr: '2. فحص رغوة مكافحة الحرائق ومعدات الإنقاذ',
    description: 'Physical barrier and apparatus inspection.',
    order: 2,
    isMandatory: true,
    fields: [],
  });

  console.log(`✓ Added ${customTemplate.sections.length} sections.`);

  // Step 4: Add fields (covering diverse types: PROJECT, TEXT, NUMBER, YES_NO, EQUIPMENT, RISK, SIGNATURE)
  console.log('Step 4: Adding diverse fields into sections...');
  const field1: FormFieldConfig = {
    id: 'fld_project_asset',
    fieldKey: 'governingAsset',
    label: 'Governing Offshore Platform Asset',
    labelAr: 'المنصة البحرية الخاضعة للتفتيش',
    fieldType: 'PROJECT',
    isRequired: true,
    defaultValue: 'Ras Laffan North Field Expansion LNG EPC-4',
    order: 1,
    sectionId: sec1Id,
    visibility: 'VISIBLE',
    permissions: 'ALL',
  };

  const field2: FormFieldConfig = {
    id: 'fld_wind_speed_knots',
    fieldKey: 'surfaceWindSpeed',
    label: 'Surface Crosswind Velocity (Knots)',
    labelAr: 'سرعة الرياح السطحية (عقدة)',
    fieldType: 'NUMBER',
    isRequired: true,
    defaultValue: 18,
    validation: { min: 0, max: 80 },
    order: 2,
    sectionId: sec1Id,
    visibility: 'VISIBLE',
    permissions: 'ALL',
  };

  const field3: FormFieldConfig = {
    id: 'fld_deck_friction_passed',
    fieldKey: 'frictionTestConforming',
    label: 'Deck Anti-Skid Friction Surface Test Conforming?',
    labelAr: 'هل فحص خشونة سطح المهبط مطابق للمواصفات؟',
    fieldType: 'YES_NO',
    isRequired: true,
    defaultValue: 'YES',
    order: 1,
    sectionId: sec2Id,
    visibility: 'VISIBLE',
    permissions: 'ALL',
  };

  const field4: FormFieldConfig = {
    id: 'fld_primary_fire_pump',
    fieldKey: 'delugeFirePumpAsset',
    label: 'Assigned High-Pressure Deluge Fire Pump',
    labelAr: 'مضخة رغوة مكافحة الحريق الرئيسية',
    fieldType: 'EQUIPMENT',
    isRequired: true,
    defaultValue: 'EQ-PUMP-03',
    order: 2,
    sectionId: sec2Id,
    visibility: 'VISIBLE',
    permissions: 'ALL',
  };

  const field5: FormFieldConfig = {
    id: 'fld_inspector_signature',
    fieldKey: 'deckOfficerSignature',
    label: 'Helideck Landing Officer (HLO) Cryptographic Signature',
    labelAr: 'توقيع ضابط هبوط المروحيات المعتمد',
    fieldType: 'SIGNATURE',
    isRequired: true,
    defaultValue: 'DIGITALLY_SIGNED_SHA256',
    order: 3,
    sectionId: sec2Id,
    visibility: 'VISIBLE',
    permissions: 'HSE_LEAD_ONLY',
  };

  customTemplate.sections[0].fields.push(field1, field2);
  customTemplate.sections[1].fields.push(field3, field4, field5);

  const totalFields = customTemplate.sections.reduce((acc, s) => acc + s.fields.length, 0);
  console.log(`✓ Added ${totalFields} fields across 2 sections.`);

  // Step 5: Save Template
  console.log('\nStep 5: Saving Template into IndexedDB persistence...');
  await TemplateManagementService.saveTemplate(customTemplate);
  const reloadedTmpl = await TemplateManagementService.getTemplateById(testTmplId);
  if (!reloadedTmpl) {
    throw new Error('Failed to retrieve saved template!');
  }
  console.log(`✓ Template successfully saved and reloaded: ${reloadedTmpl.code} - "${reloadedTmpl.title}".`);

  // Step 6: Create living Document from Template
  console.log('\nStep 6: Creating Living Document instance from the Template...');
  const testDocCode = 'HSE-HLD-001-REV00';
  const initialFieldValues = {
    fld_project_asset: 'Ras Laffan North Field Expansion LNG EPC-4',
    fld_wind_speed_knots: 22,
    fld_deck_friction_passed: 'YES',
    fld_primary_fire_pump: 'EQ-PUMP-03',
    fld_inspector_signature: 'DIGITALLY_SIGNED_SHA256',
  };

  const createdDoc = await TemplateManagementService.createDocumentFromTemplate(
    reloadedTmpl,
    {
      code: testDocCode,
      title: 'Offshore Helideck Pre-Flight Readiness Inspection',
      titleAr: 'تفتيش جاهزية مهبط المروحيات البحرية قبل الإقلاع',
      projectId: 'prj-rl-epc4',
      retentionYears: 10,
      authorId: 'Lead Offshore Safety Inspector',
      revisionNumber: 'Rev 1.0',
    },
    initialFieldValues
  );

  console.log(`✓ Living Document successfully generated with Code: ${createdDoc.code}, Status: ${createdDoc.status}`);

  // Step 7: Load and verify initial document content
  console.log('\nStep 7: Loading generated document content...');
  let loadedContent = await TemplateManagementService.loadDocumentContent(createdDoc.code);
  console.log('✓ Document values loaded from revision:');
  console.log('  Wind Speed:', loadedContent.values.fld_wind_speed_knots);
  console.log('  Deck Friction:', loadedContent.values.fld_deck_friction_passed);
  console.log('  Fire Pump:', loadedContent.values.fld_primary_fire_pump);

  if (loadedContent.values.fld_wind_speed_knots !== 22) {
    throw new Error(`Expected wind speed 22, got ${loadedContent.values.fld_wind_speed_knots}`);
  }

  // Step 8: Edit document values
  console.log('\nStep 8: Modifying document values (demonstrating living editable form)...');
  const updatedFieldValues = {
    ...initialFieldValues,
    fld_wind_speed_knots: 35, // Increased wind
    fld_deck_friction_passed: 'YES',
    fld_primary_fire_pump: 'EQ-PUMP-03',
    remarks: 'Verified high crosswind advisory active. Landing approved with caution.',
  };

  await TemplateManagementService.updateDocumentContent(
    createdDoc.code,
    updatedFieldValues,
    'Lead Offshore Safety Inspector',
    'Updated crosswind reading prior to landing'
  );
  console.log('✓ Document revision updated.');

  // Step 9: Reload document and verify data persistence
  console.log('\nStep 9: Reloading document and verifying data persistence...');
  const reloadedContentAfterEdit = await TemplateManagementService.loadDocumentContent(createdDoc.code);

  console.log('✓ Reloaded values:');
  console.log('  Wind Speed (Expected 35):', reloadedContentAfterEdit.values.fld_wind_speed_knots);
  console.log('  Remarks:', reloadedContentAfterEdit.values.remarks);

  if (reloadedContentAfterEdit.values.fld_wind_speed_knots !== 35) {
    throw new Error(
      `Persistence verification failed! Expected 35, got ${reloadedContentAfterEdit.values.fld_wind_speed_knots}`
    );
  }

  // Step 10: Test Duplicate Template
  console.log('\nStep 10: Testing Duplicate Template...');
  const duplicatedTmpl = await TemplateManagementService.duplicateTemplate(testTmplId, 'Corporate Admin');
  console.log(`✓ Duplicated template created with Code: ${duplicatedTmpl.code}, Sections: ${duplicatedTmpl.sections.length}`);
  if (!duplicatedTmpl.code.includes('COPY') || duplicatedTmpl.sections.length !== 2) {
    throw new Error('Duplication verification failed!');
  }

  // Step 11: Test Archive Template
  console.log('\nStep 11: Testing Archive Template...');
  await TemplateManagementService.archiveTemplate(duplicatedTmpl.id);
  const archivedTmpl = await TemplateManagementService.getTemplateById(duplicatedTmpl.id);
  console.log(`✓ Archived template status: ${archivedTmpl?.status}`);
  if (archivedTmpl?.status !== 'ARCHIVED') {
    throw new Error('Archive verification failed!');
  }

  console.log('\n======================================================');
  console.log('ALL PHASE 3 REQUIREMENTS & LIFECYCLE TESTS PASSED 100%!');
  console.log('======================================================\n');
}

runTest().catch((err) => {
  console.error('TEST RUN FAILED:', err);
  process.exit(1);
});
