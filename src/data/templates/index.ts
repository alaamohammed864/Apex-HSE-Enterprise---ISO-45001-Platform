import { DynamicDocumentTemplateConfig } from '../../types/formFieldConfig';
import { HSE_PLAN_TEMPLATE } from './hsePlanTemplate';
import { SOP_TEMPLATE } from './sopTemplate';
import {
  HSE_PROCEDURE_TEMPLATE,
  TRAFFIC_MANAGEMENT_PLAN_TEMPLATE,
  EMERGENCY_RESPONSE_PLAN_TEMPLATE,
  FIRE_PLAN_TEMPLATE,
} from './proceduresAndPlansTemplates';
import {
  HSE_MANUAL_TEMPLATE,
  HSE_POLICY_TEMPLATE,
  MOBILISATION_VERIFICATION_TEMPLATE,
  CONTRACT_HSE_REQUIREMENTS_TEMPLATE,
} from './governanceTemplates';

export * from './hsePlanTemplate';
export * from './sopTemplate';
export * from './proceduresAndPlansTemplates';
export * from './governanceTemplates';

export const ALL_PROFESSIONAL_TEMPLATES: Record<string, DynamicDocumentTemplateConfig> = {
  'TMPL-HSE-PLN': HSE_PLAN_TEMPLATE,
  'TMPL-HSE-PRC': HSE_PROCEDURE_TEMPLATE,
  'TMPL-HSE-SOP': SOP_TEMPLATE,
  'TMPL-HSE-MNL': HSE_MANUAL_TEMPLATE,
  'TMPL-HSE-POL': HSE_POLICY_TEMPLATE,
  'TMPL-HSE-TRF': TRAFFIC_MANAGEMENT_PLAN_TEMPLATE,
  'TMPL-HSE-ERP': EMERGENCY_RESPONSE_PLAN_TEMPLATE,
  'TMPL-HSE-FIR': FIRE_PLAN_TEMPLATE,
  'TMPL-HSE-MOB': MOBILISATION_VERIFICATION_TEMPLATE,
  'TMPL-HSE-CNT': CONTRACT_HSE_REQUIREMENTS_TEMPLATE,
};

export const DEFAULT_DYNAMIC_TEMPLATES = ALL_PROFESSIONAL_TEMPLATES;
