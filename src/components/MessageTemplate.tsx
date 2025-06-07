"use client";

import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import { useQuery, useMutation, gql } from "@apollo/client";
import {
  Loader,
  Plus,
  Trash,
  Pencil,
  Image as ImageIcon,
} from "lucide-react";
import {
  GET_MESSAGE_TEMPLATES,
  CREATE_MESSAGE_TEMPLATE,
  DELETE_MESSAGE_TEMPLATE,
} from "@/graphql/operations";
import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/i18n";
import Select from "react-select";
import RichTextEditor from "@/components/RichTextEditor";

/* --- update mutation (local) ------------------------------------------------ */
const UPDATE_MESSAGE_TEMPLATE = gql`
  mutation UpdateMessageTemplate($id: ID!, $data: MessageTemplateUpdateInput!) {
    updateMessageTemplate(where: { id: $id }, data: $data) {
      id
    }
  }
`;

export default function MessageTemplate() {
  const { lang } = useLanguage();

  /* ── queries & mutations ─────────────────────── */
  const { data, loading, error, refetch } = useQuery(GET_MESSAGE_TEMPLATES);

  const [createTemplate] = useMutation(CREATE_MESSAGE_TEMPLATE, {
    onCompleted: () => refetch(),
  });
  const [updateTemplate] = useMutation(UPDATE_MESSAGE_TEMPLATE, {
    onCompleted: () => refetch(),
  });
  const [deleteTemplate, { loading: deleting }] = useMutation(
    DELETE_MESSAGE_TEMPLATE,
    { onCompleted: () => refetch() },
  );

  /* ── form state ──────────────────────────────── */
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("<p></p>");
  const [type, setType] = useState("bestPractice");
  const [urgency, setUrgency] = useState("normal");
  const [mediaId, setMediaId] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [channelMask, setChannelMask] = useState([
    { value: "IN_APP_WEB", label: "In-app" },
  ]);
  const [requireAck, setRequireAck] = useState(false);
  const [maxViews, setMaxViews] = useState("");
  const [start, setStart] = useState(dayjs().format("YYYY-MM-DD"));
  const [end, setEnd] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  /* ── helpers ─────────────────────────────────── */
  const titles = useMemo(
    () =>
      data?.messageTemplates
        .filter((x: unknown) => x.id !== editingId)
        .map((m: unknown) => m.title.toLowerCase()) ?? [],
    [data, editingId],
  );
  const isDuplicate = title && titles.includes(title.toLowerCase());

  const channelOptions = [
    { value: "IN_APP_WEB", label: t[lang].channel_inApp },
    { value: "EMAIL", label: t[lang].channel_email },
    { value: "SMS", label: t[lang].channel_sms },
    { value: "PUSH", label: t[lang].channel_push },
  ];

  /* ── load template into form for editing ──────── */
  const loadTemplate = (tpl: unknown) => {
    setEditingId(tpl.id);
    setTitle(tpl.title ?? "");
    setBody(tpl.bodyMarkdown ?? "<p></p>");
    setType(tpl.type);
    setUrgency(tpl.urgency);
    setMediaId(tpl.mediaId ?? "");
    setCtaLabel(tpl.ctaLabel ?? "");
    setCtaLink(tpl.ctaLink ?? "");
    setChannelMask(
      (tpl.channelMask ?? ["IN_APP_WEB"]).map((v: string) => ({
        value: v,
        label: channelOptions.find((c) => c.value === v)?.label ?? v,
      })),
    );
    setRequireAck(tpl.requireAcknowledgement ?? false);
    setMaxViews(tpl.maxViews?.toString() ?? "");
    setStart(tpl.startAt ? dayjs(tpl.startAt).format("YYYY-MM-DD") : "");
    setEnd(tpl.endAt ? dayjs(tpl.endAt).format("YYYY-MM-DD") : "");
    setErrorMsg(null);
  };

  /* ── reset form ───────────────────────────────── */
  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBody("<p></p>");
    setType("bestPractice");
    setUrgency("normal");
    setMediaId("");
    setCtaLabel("");
    setCtaLink("");
    setChannelMask([{ value: "IN_APP_WEB", label: t[lang].channel_inApp }]);
    setRequireAck(false);
    setMaxViews("");
    setStart(dayjs().format("YYYY-MM-DD"));
    setEnd("");
    setErrorMsg(null);
  };

  /* ── submit handler ───────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isDuplicate) {
      setErrorMsg(t[lang].duplicateTitleError);
      return;
    }
    setSaving(true);
    try {
      const baseData = {
        title,
        bodyMarkdown: body,
        type,
        urgency,
        mediaId,      // ← always include (empty string if untouched)
        ctaLabel,
        ctaLink,
        channelMask: channelMask.map((c) => c.value),
        requireAcknowledgement: requireAck,
        maxViews: maxViews ? parseInt(maxViews) : null,
        startAt: start ? new Date(start) : null,
        endAt: end ? new Date(end) : null,
      };

      if (editingId) {
        await updateTemplate({
          variables: { id: editingId, data: baseData },
        });
      } else {
        await createTemplate({
          variables: baseData,
        });
      }
      resetForm();
    } catch (err: unknown) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  /* ── UI ───────────────────────────────────────── */
  return (
    <section className="border rounded p-4 space-y-4">
      <h2 className="text-xl font-semibold flex items-center gap-2">
        {editingId ? (
          <>
            <Pencil className="w-5 h-5" />{" "}
            {t[lang].editTemplateLabel ?? "Edit message template"} – {title}
          </>
        ) : (
          <>
            <Plus className="w-5 h-5" /> {t[lang].newTemplateLabel}
          </>
        )}
      </h2>

      {/* ── form ─────────────────────────────────── */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className={`border rounded p-2 w-full${
            isDuplicate ? " border-red-500" : ""
          }`}
          placeholder={t[lang].titlePlaceholder}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <RichTextEditor value={body} onChange={setBody} />

        <div className="flex gap-2 items-center">
          <ImageIcon className="w-5 h-5 text-gray-500" />
          <input
            className="border rounded p-2 flex-1"
            placeholder={t[lang].mediaIdPlaceholder}
            value={mediaId}
            onChange={(e) => setMediaId(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          <input
            className="border rounded p-2"
            placeholder={t[lang].ctaLabelPlaceholder}
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
          />
          <input
            className="border rounded p-2"
            placeholder={t[lang].ctaLinkPlaceholder}
            value={ctaLink}
            onChange={(e) => setCtaLink(e.target.value)}
          />
        </div>

        <div className="grid md:grid-cols-2 gap-2">
          <select
            className="border rounded p-2 h-10"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="bestPractice">{t[lang].type_bestPractice}</option>
            <option value="regulatory">{t[lang].type_regulatory}</option>
            <option value="featureUpdate">{t[lang].type_featureUpdate}</option>
            <option value="promotional">{t[lang].type_promotional}</option>
            <option value="referral">{t[lang].type_referral}</option>
            <option value="incident">{t[lang].type_incident}</option>
            <option value="operational">{t[lang].type_operational}</option>
          </select>

          <select
            className="border rounded p-2 h-10"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
          >
            <option value="critical">{t[lang].urgency_critical}</option>
            <option value="high">{t[lang].urgency_high}</option>
            <option value="normal">{t[lang].urgency_normal}</option>
            <option value="low">{t[lang].urgency_low}</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm text-gray-600">
            {t[lang].channelsLabel}
          </label>
          <Select
            options={channelOptions}
            isMulti
            value={channelMask}
            onChange={(val) => setChannelMask(val as unknown)}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={requireAck}
                onChange={(e) => setRequireAck(e.target.checked)}
              />
              {t[lang].requireAckLabel}
            </label>
            <input
              className="border rounded p-2 h-10 w-28"
              type="number"
              min={0}
              placeholder={t[lang].maxViewsPlaceholder}
              value={maxViews}
              onChange={(e) => setMaxViews(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                {t[lang].validFromLabel}
              </label>
              <input
                className="border rounded p-2 h-10"
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-1">
                {t[lang].validUntilLabel}
              </label>
              <input
                className="border rounded p-2 h-10"
                type="date"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || isDuplicate || !title}
            className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {saving
              ? t[lang].savingEllipsis
              : editingId
              ? t[lang].saveChangesBtn ?? "Save changes"
              : t[lang].createTemplateBtn}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="py-2 px-4 rounded border hover:bg-gray-50"
            >
              {t[lang].cancelBtn ?? "Cancel"}
            </button>
          )}
        </div>
        {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
      </form>

      {/* ── list ─────────────────────────────────── */}
      {loading && (
        <p>
          <Loader className="inline w-4 h-4 animate-spin" />{" "}
          {t[lang].loadingLabel}
        </p>
      )}
      {error && <p className="text-red-600">{error.message}</p>}

      <ul className="grid md:grid-cols-2 gap-4">
        {data?.messageTemplates.map((m: unknown) => (
          <li key={m.id} className="border rounded p-3 space-y-1 relative">
            <button
              onClick={() => loadTemplate(m)}
              title={t[lang].editTemplateLabel ?? "Edit"}
              className="absolute right-10 top-2 text-blue-600 hover:text-blue-800"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                if (confirm(t[lang].confirmDeleteTemplate))
                  deleteTemplate({ variables: { id: m.id } });
              }}
              disabled={deleting}
              title={t[lang].deleteTemplateLabel}
              className="absolute right-2 top-2 text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              <Trash className="w-4 h-4" />
            </button>
            <div className="font-semibold overflow-hidden text-ellipsis whitespace-nowrap">
              {m.title}
            </div>
            <div className="text-sm text-gray-500">
              {t[lang][`type_${m.type}`]} | {t[lang][`urgency_${m.urgency}`]}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
